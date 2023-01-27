import { auth, provider } from "../../firebase"
import { signInWithPopup } from "firebase/auth"
import { Grid, Button, Card, CardContent, Container, Avatar, Typography } from "@mui/material"
import GoogleIcon from '@mui/icons-material/Google';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
export default function Login() {

    const handleSignIn = async () => {
        const res = await signInWithPopup(auth, provider)
        console.log(res)
    }

    return (
        <Container>
            <Grid container sx={{ height: '100vh' }}>
                <Grid item xs={6} md={4} sx={{ margin: 'auto' }}>
                    <Card sx={{ p: 2 }}>
                        <CardContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Avatar sx={{ m: 2, bgcolor: 'red' }}>
                                <LockOutlinedIcon />
                            </Avatar>
                            <Typography my={2} variant="h4"> LOGIN</Typography>


                            <Typography mb={2} variant="h6"> Welcome to Fakebook</Typography>

                            <Button onClick={handleSignIn} variant="contained" startIcon={<GoogleIcon />}>
                                Sign In With Google
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

            </Grid>
        </Container>
    )
}