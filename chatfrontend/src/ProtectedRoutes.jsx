import { Navigate } from "react-router-dom";


const ProtectedRoutes = ({ children }) => {

    const userLogin = localStorage.getItem('login')
    return (

        userLogin ? children : <Navigate to="/" />

    )
}


export default ProtectedRoutes