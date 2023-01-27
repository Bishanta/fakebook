import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebase'
import { useAuthState } from 'react-firebase-hooks/auth'

export default function AuthGuardedComponent() {
    const [user, loading] = useAuthState(auth)
    const location = useLocation();
    const isLoginPagePathname = location.pathname.includes('login');

    if (loading) {
        return (
            <h1>loading...</h1>
        )
    }

    if (user) {
        if (isLoginPagePathname) {
            const { from = { pathname: '/' } } = location.state;
            return <Navigate to={from.pathname} state={{ from }} replace />;
        }

        return (
            <>
                <Outlet />
            </>
        );
    } else {
        if (isLoginPagePathname) {
            return <Outlet />;
        }

        return <Navigate to="/login" state={{ from: location }} replace />;
    }

}