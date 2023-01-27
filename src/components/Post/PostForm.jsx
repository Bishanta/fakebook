import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";
import { DialogTitle, DialogContent, Button, MenuItem, InputLabel, FormControl, Select, DialogActions, Typography, TextField } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field } from "formik";
import * as Yup from 'yup';
import { useRef, useEffect, useState } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db, auth, storage } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
import TextareaAutosize from '@mui/base/TextareaAutosize';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import Dropzone from 'react-dropzone-uploader';
import 'react-dropzone-uploader/dist/styles.css'
const BootstrapDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

function BootstrapDialogTitle(props) {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );

}

BootstrapDialogTitle.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func.isRequired,
};


export default function PostForm({ open, setOpen }) {
    const initialValues = {
        caption: '',
        description: ''
    }

    const postsRef = collection(db, "posts")

    const formRef = useRef()
    const [selectData, setSelectData] = useState('')
    const [file, setFile] = useState([])
    const [user] = useAuthState(auth)

    const validationSchema = Yup.object().shape({
        caption: Yup.string()
            .min(2, 'Too Short!')
            .max(200, 'Too Long!')
            .required('Caption is required')
    });

    const handleSubmit = async (data) => {
        try {
            if (file.length === 0) {
                await addDoc(postsRef, {
                    ...data,
                    createdAt: serverTimestamp(),
                    user: {
                        id: user.uid,
                        displayName: user.displayName,
                        photoUrl: user.photoURL,
                    }
                })
                alert('post added')
            }
            else {
                const storageRef = ref(storage, `/files/${file[0].name}`)
                const uploadTask = uploadBytesResumable(storageRef, file[0]);

                uploadTask.on(
                    "state_changed",
                    () => {
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            addDoc(postsRef, {
                                ...data,
                                media: url,
                                createdAt: serverTimestamp(),
                                user: {
                                    id: user.uid,
                                    displayName: user.displayName,
                                    photoUrl: user.photoURL,
                                }
                            })
                            alert('post added')
                        });
                    }
                );
            }
            setOpen(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    const onStatusChange = async (event) => {
        if (event.meta.status === "removed")
            setFile([])

        if (event.meta.status === "done")
            setFile([event.file])
    }

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="dialog-title"
            open={open}
            fullWidth
            maxWidth='md'
        >
            <BootstrapDialogTitle id="dialog-title" onClose={handleClose}>
                Add Post
            </BootstrapDialogTitle>
            <DialogContent sx={{ minHeight: '60vh' }} dividers>
                <Formik
                    innerRef={formRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {
                        ({ errors, touched }) => (
                            <Form>
                                <Field error={errors.caption && touched.caption} as={TextField} fullWidth name="caption" placeholder="Caption" />
                                {errors.caption && touched.caption ? (
                                    <Typography variant='caption' mt={1} sx={{ color: 'red' }}>{errors.caption}</Typography>
                                ) : null}
                                <FormControl mt={3} sx={{ marginTop: 3 }} fullWidth>
                                    <InputLabel id="content-type-select">Content</InputLabel>
                                    <Select onChange={(event) => setSelectData(event.target.value)} value={selectData} labelId="content-type-select" label="Content" fullWidth>
                                        <MenuItem value={'text'}>Text</MenuItem>
                                        <MenuItem value={'image'}>Image</MenuItem>
                                    </Select>
                                </FormControl>
                                {selectData === 'text' && <FormControl mt={3} sx={{ marginTop: 3 }} fullWidth>
                                    <Field as={TextareaAutosize} minRows={12} style={{ padding: 10 }} name="description" placeholder="Enter Content..." />
                                </FormControl>}
                                {selectData === 'image' &&
                                    <Dropzone
                                        maxFiles={1}
                                        onChangeStatus={(status) => onStatusChange(status)}
                                        multiple={false}
                                        initialFiles={file}
                                        inputContent="Select Post Image"
                                        styles={{
                                            dropzone: { overflow: 'hidden', marginTop: '25px', height: '200px' }
                                        }}
                                    />}
                            </Form>
                        )
                    }
                </Formik>
            </DialogContent>
            <DialogActions>
                <Button type="submit" sx={{ background: '#2196f3' }} variant="contained" onClick={() => formRef.current && formRef.current.handleSubmit()}>Save</Button>
                {/* {editID ? <Button color="primary" disabled={state.isLoading} onClick={() => handleSubmit('edit')}>
                        Edit Bank
                    </Button> : <Button color="primary" disabled={state.isLoading} onClick={() => handleSubmit('create')}>
                        Create Bank
                    </Button>}
                    <Button color="secondary" style={{ color: 'red' }} onClick={handleClose}>
                        Cancel
                    </Button> */}
            </DialogActions>
        </BootstrapDialog>
    )
}