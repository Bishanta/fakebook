import { Grid, Typography } from "@mui/material"
import Dropdown from "./Dropdown"

export default function Navbar() {
    return (
        <Grid container px={4} py={2} justifyContent="space-between" sx={{ background: '#2196f3', color: 'white' }}>
            <Grid item>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>Fakebook</Typography>
            </Grid>
            <Grid item>
                <Dropdown />
            </Grid>
        </Grid>
    )
}