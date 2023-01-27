import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";
import { DialogTitle, DialogContent, DialogActions } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import { Formik, Form, Field } from "formik";
import * as Yup from 'yup';
import { useRef, useEffect } from 'react';
import { addDoc, collection, serverTimestamp } from "firebase/firestore"
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
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


export default function PostDetail({ open, setOpen }) {
    const initialValues = {
        caption: '',
        description: ''
    }

    const postsRef = collection(db, "posts")

    const formRef = useRef()
    const [user] = useAuthState(auth)

    const validationSchema = Yup.object().shape({
        caption: Yup.string()
            .min(2, 'Too Short!')
            .max(200, 'Too Long!')
            .required('Caption is required'),
        description: Yup.string()
            .min(2, 'Too Short!')
            .required('Description is required'),
    });

    const handleSubmit = async (data) => {
        try {
            await addDoc(postsRef, {
                ...data,
                createdAt: serverTimestamp(),
                user: {
                    id: user.uid,
                    displayName: user.displayName,
                    photoUrl: user.photoURL,
                    createdAt: db.ServerValue.TIMESTAMP
                }
            })
            alert('post added!')
            setOpen(false)
        } catch (error) {
            console.log(error)
        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="dialog-title"
            open={open}
            fullWidth
            maxWidth='xs'
        >
            <BootstrapDialogTitle id="dialog-title" onClose={handleClose}>
                Add Post
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
                                <div>
                                    <Field name="caption" placeholder="Caption" />
                                    {errors.caption && touched.caption ? (
                                        <div>{errors.caption}</div>
                                    ) : null}
                                </div>
                                <div>
                                    <Field name="description" placeholder="Description" />
                                    {errors.description && touched.description ? (
                                        <div>{errors.description}</div>
                                    ) : null}
                                </div>
                            </Form>
                        )
                    }
                </Formik>
            </DialogContent>
            <DialogActions>
                <button type="submit" onClick={() => formRef.current && formRef.current.handleSubmit()}>Save</button>
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