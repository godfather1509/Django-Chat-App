import axios from "axios";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../../token";

const api = axios.create(
    {
        baseURL: 'http://127.0.0.1:8000/chat/'
    }
)

api.interceptors.request.use(
    // this will add jwt token in all API calls automatically
    (config) => {
        const accessToken = localStorage.getItem(ACCESS_TOKEN)
        if (accessToken) {
            config.headers.Authorization = `Bearer ${accessToken}`
        }
        return config
    },
    (error) => {
        Promise.reject(error)
    }

)

export default api;

const publicapi = axios.create({
    baseURL: 'http://127.0.0.1:8000/chat/'
})

export { publicapi };