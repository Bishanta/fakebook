import { auth, db, messaging } from "../firebase"
import PostForm from "../components/Post/PostForm"
import { writeBatch, where, addDoc, limit, collection, query, orderBy } from "firebase/firestore"
import { useEffect, useState } from "react"
import { useCollection } from "react-firebase-hooks/firestore"
import Post from "../components/Post"
import { getToken, onMessage } from "firebase/messaging"
import { useAuthState } from 'react-firebase-hooks/auth'
import { Container } from "@mui/system"
import { Grid, Box, Button } from "@mui/material"
import Navbar from "../components/Navbar"
import AddIcon from '@mui/icons-material/Add';
export default function Home() {
    const [postModalOpen, setPostModalOpen] = useState(false)
    const [isFirebaseInitialized, setIsFirebaseInitialized] = useState(false)

    const batch = writeBatch(db)
    const [user] = useAuthState(auth)

    const registerToken = async (token) => {
        try {
            tokens.docs.forEach(doc => {
                batch.delete(doc.ref)
            })

            await batch.commit()

            await addDoc(tokenRef, {
                token,
                userId: user?.uid
            })
        } catch (error) {
            console.log(error)
        }
    }

    const initializeFirebase = async () => {
        try {
            setIsFirebaseInitialized(true)
            const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_VAPID_KEY })
            registerToken(token)
            onMessage(messaging, (payload) => {
                console.log(payload, "Notification recieved!")
            })
        } catch (error) {
            console.log(error)
        }
    }

    const postRef = collection(db, "posts")
    const tokenRef = collection(db, "tokens")
    const [posts] = useCollection(query(postRef, orderBy('createdAt', 'desc'), limit(25)))
    const [tokens] = useCollection(user && query(tokenRef, where('userId', '==', user.uid)))

    useEffect(() => {
        if (user && tokens && !isFirebaseInitialized) { initializeFirebase() }
    }, [user, tokens])

    return (
        <>
            <PostForm open={postModalOpen} setOpen={setPostModalOpen} />

            <Navbar />

            <Container>
                <Grid container direction="column" alignItems="center" py={{ md: 3, xs: 2 }} rowGap={{ xs: 2, md: 3 }}>
                    <Grid sx={{ width: { md: '60%', xs: '80%' } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'end' }}>
                            <Button onClick={() => setPostModalOpen(true)} sx={{ background: '#2196f3' }} variant="contained" startIcon={<AddIcon />}>
                                Add Post
                            </Button>
                        </Box>
                    </Grid>
                    {posts?.docs.map(doc => {
                        return <Grid key={doc.id} sx={{ width: { md: '60%', xs: '80%' } }}>
                            <Post post={{ id: doc.id, ...doc.data() }} />
                        </Grid>
                    })}
                </Grid>
            </Container>

        </>

    )
}