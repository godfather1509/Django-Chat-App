import { useNavigate } from "react-router-dom";


const NotFound = () => {

    const navigate = useNavigate()
    return (

        <>
            {
                localStorage.getItem('login') ? (<p>404 Not Found</p>) :
                    navigate("/")
            }

        </>
    )
}

export default NotFound;