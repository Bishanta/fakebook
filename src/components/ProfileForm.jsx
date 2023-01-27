import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";
import { DialogTitle, DialogContent, DialogActions, Button, TextField, Box, Typography } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field, useFormikContext } from "formik";
import * as Yup from 'yup';
import { useRef, useEffect, useState } from 'react';
import { db, auth, storage } from '../firebase';
import { updateProfile } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth'
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

const DropzoneComponent = (component) => {
    return (component).default ?? component
}

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


export default function ProfileForm({ open, setOpen }) {
    const formRef = useRef()
    const [user] = useAuthState(auth)
    const [file, setFile] = useState([])

    const DropzoneFix = DropzoneComponent(Dropzone)


    const validationSchema = Yup.object().shape({
        displayName: Yup.string()
            .min(2, 'Too Short!')
            .max(200, 'Too Long!')
            .required('Display name is required')
    });

    const initialValues = {
        displayName: user?.displayName || '',
        photoURL: user?.photoURL || ''
    }

    const handleSubmit = async (data) => {
        try {
            if (file.length === 0 || file[0].name === user?.uid) {
                await updateProfile(user, {
                    'displayName': data.displayName,
                    'photoURL': data.photoURL
                })
                alert('profile updated!')
            }
            else {
                const storageRef = ref(storage, `/files/${file[0].name}`)
                const uploadTask = uploadBytesResumable(storageRef, file[0]);

                console.log("nothing happening")
                uploadTask.on(
                    "state_changed",
                    (snapshot) => {

                        console.log(snapshot, "Printing snap")

                        const percent = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
                        );
                        console.log(percent, "Printing percentage")
                        // update progress
                        // setPercent(percent);
                    },
                    (err) => console.log(err),
                    () => {
                        // download url
                        console.log('upload completed')
                        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
                            console.log(url, "Printing url of upload");
                            updateProfile(user, {
                                'displayName': data.displayName,
                                'photoURL': url
                            })
                            alert('profile updated')
                        });
                    }
                );
            }
            setOpen(false)
        } catch (error) {

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
            maxWidth='xs'
        >
            <BootstrapDialogTitle id="dialog-title" onClose={handleClose}>
                Update Profile
            </BootstrapDialogTitle>
            <DialogContent dividers>
                <Formik
                    innerRef={formRef}
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={handleSubmit}
                >
                    {
                        ({ errors, touched }) => (
                            <Form>
                                <Box mb={2}>
                                    <Field as={TextField} name="displayName" placeholder="Display Name" fullWidth />
                                    {errors.displayName && touched.displayName ? (
                                        <Typography sx={{ color: 'red' }}>{errors.displayName}</Typography>
                                    ) : null}
                                </Box>
                                <DropzoneFix
                                    maxFiles={1}
                                    onChangeStatus={(status) => onStatusChange(status)}
                                    multiple={false}
                                    inputContent="Select Profile Image"
                                    styles={{
                                        dropzone: { overflow: 'hidden' }
                                    }}
                                />
                            </Form>
                        )
                    }
                </Formik>
                <div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant="contained" type="submit" onClick={() => formRef.current && formRef.current.handleSubmit()}>Save</Button>
            </DialogActions>
        </BootstrapDialog>
    )
}