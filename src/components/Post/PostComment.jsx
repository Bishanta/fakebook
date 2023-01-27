import Dialog from '@mui/material/Dialog';
import { styled } from '@mui/material/styles';
import PropTypes from "prop-types";
import { DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useEffect, useRef } from 'react';
import { addDoc, where, collection, orderBy, serverTimestamp, query, limit } from "firebase/firestore"
import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from "react-firebase-hooks/firestore"
import { Box, Avatar, Typography, IconButton, Snackbar } from '@mui/material';
import TextareaAutosize from '@mui/base/TextareaAutosize';
import SendIcon from '@mui/icons-material/Send';

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


export default function PostComment({ open, setOpen, post }) {

    const commentRef = collection(db, "comments")

    const inputRef = useRef()
    const topViewRef = useRef()
    const [user] = useAuthState(auth)

    const [comments] = useCollection(query(commentRef, where('postId', '==', post.id), orderBy('createdAt', 'desc'), limit(25)))

    const handleSubmit = async () => {
        if (inputRef.current.value === "") {
            return;
        }
        try {
            await addDoc(commentRef, {
                content: inputRef.current.value,
                postId: post.id,
                createdAt: serverTimestamp(),
                user: {
                    id: user.uid,
                    displayName: user.displayName,
                    photoUrl: user.photoURL,
                    createdAt: serverTimestamp()
                }
            })
            inputRef.current.value = ""
        } catch (error) {
            //THROW ERROR
            console.log(error)
        }
    }

    const handleClose = () => {
        setOpen(false);
    };

    useEffect(() => {
        comments && topViewRef.current?.scrollIntoView({ behaviour: 'smooth' })
    }, [comments])
    return (
        <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="dialog-title"
            open={open}
            fullWidth
            maxWidth='sm'
        >
            <BootstrapDialogTitle id="dialog-title" onClose={handleClose}>
                Post Comments
            </BootstrapDialogTitle>
            <DialogContent sx={{ minHeight: '60vh' }} dividers>
                <div ref={topViewRef}></div>
                {comments && comments.docs.map(doc =>
                    <Box key={doc.id} mb={{ sm: 2, md: 3 }} sx={{ display: 'flex', flexDirection: 'column' }}>
                        <Box sx={{ display: 'flex' }}>
                            <Avatar src={doc.data().user.photoUrl} />
                            <Box ml={1} px={2} py={1} sx={{ background: '#e8eaf6', borderRadius: 3, width: '100%' }}>
                                <Typography sx={{ fontWeight: 600 }} variant="subtitle2">
                                    {doc.data().user.displayName}
                                </Typography>
                                <Typography>
                                    {doc.data().content}
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                <TextareaAutosize ref={inputRef} arai-label="Enter comment" minRows={2} maxRows={2} placeholder="Enter comment" style={{ width: '100%', padding: 5 }} />
                {/* <Button type="button" onClick={handleSubmit}>submit</Button> */}
                <IconButton onClick={handleSubmit} aria-label="send message" color="success">
                    <SendIcon />
                </IconButton>
            </DialogActions>
        </BootstrapDialog>
    )
}