import { db, auth } from '../../firebase';
import { useAuthState } from 'react-firebase-hooks/auth'
import { useCollection } from "react-firebase-hooks/firestore"
import { addDoc, where, writeBatch, query, collection, limit } from 'firebase/firestore';
import { useCallback, useState } from 'react';
import PostComment from './PostComment';
import { Card, Avatar, Box, Typography, Divider } from '@mui/material';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
export default function Post({ post }) {
    const [open, setOpen] = useState(false)
    const likeRef = collection(db, "likes")
    const commentRef = collection(db, "comments")
    const [likes] = useCollection(query(likeRef, where('postId', '==', post.id)))
    const [comments] = useCollection(query(commentRef, where('postId', '==', post.id)))
    const [user] = useAuthState(auth)

    const batch = writeBatch(db)
    const isLiked = useCallback(() => {
        return likes && likes.docs.some(doc => {
            return doc.data().postId === post.id && doc.data().userId === user.uid
        })
    }, [likes])

    const handlePostLike = async () => {
        try {
            await addDoc(likeRef, {
                userId: user.uid,
                postId: post.id
            })
        } catch (error) {
            console.log(error)
        }
    }

    const handleLikeDelete = async () => {
        try {
            likes.docs.forEach(doc => {
                if (doc.data().postId === post.id && doc.data().userId === user.uid)
                    batch.delete(doc.ref)
            })
            await batch.commit()
        } catch (error) {

        }
    }

    return (
        <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex' }}>
                <Avatar src={post.user.photoUrl} alt="author image" />
                <Box ml={1}>
                    <Typography sx={{ fontWeight: 600 }}>{post.user.displayName}</Typography>
                    <Typography variant='caption'>{post.createdAt?.toDate().toDateString()}</Typography>
                </Box>

            </Box>
            <Typography mt={2} mb={1}> {post.caption}</Typography>
            {post.media && <Box><img style={{ width: '100%', maxHeight: '400px', objectFit: 'contain' }} src={post.media} /></Box>}
            {post.description && <Typography my={2}> {post.description}</Typography>}
            <Box sx={{ display: 'flex' }}>
                <Typography variant='caption'>{likes?.size} {likes?.size === 1 ? 'like' : 'likes'}</Typography>
                <Typography variant='caption' ml={2}>{comments?.size} {comments?.size === 1 ? 'comment' : 'comments'}</Typography>
            </Box>
            <Divider />
            <Box mt={1}>
                {isLiked() ? <FavoriteIcon sx={{ cursor: 'pointer' }} onClick={handleLikeDelete} /> : <FavoriteBorderIcon sx={{ cursor: 'pointer' }} onClick={handlePostLike} />}
                <ChatBubbleOutlineIcon sx={{ marginLeft: 3, cursor: 'pointer' }} onClick={() => { setOpen(true) }} />
            </Box>

            <PostComment post={post} open={open} setOpen={setOpen} />
        </Card >
    )
}