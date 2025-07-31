import { useForm } from "react-hook-form"
import { useState } from 'react'
import { Eye, EyeOff } from "lucide-react";
import { SiGoogle } from "react-icons/si";
import { Link, useNavigate } from 'react-router-dom'
import { publicapi } from "../api/baseurl";

const Register = () => {
    const navigate = useNavigate()
    const [error, setError] = useState(null)
    const [showPassword, setShowPassword] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm()

    const handelPost = async (newUser) => {
        console.log(newUser)
        try {
            const response = await publicapi.post('auth/register/', newUser)
            console.log(response.data)
            navigate("/")
        } catch (error) {
            console.log(error)
            console.log(error.response.data)
            console.log(error.response.status)
            setError(error.response?.data || { message: "Registration failed" });
            userLogin.setLogIn(false)
        }
    }

    const handleGoogleLogin = () => {
        console.log("Login")
    }


    const togglePassword = () => setShowPassword(prev => !prev);


    return (
        <>
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-104px)] px-4 text-black">
                <h1 className="text-4xl font-bold text-center text-black mb-4">
                    Register
                </h1>


                <form
                    onSubmit={handleSubmit((data) => {
                        handelPost(data);
                    })}
                    className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg"
                >
                    <div className="flex flex-col gap-3 mb-6">
                        {/* Google Login Button */}
                        <button
                            type="button"
                            onClick={handleGoogleLogin}
                            className="cursor-pointer w-full flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold text-gray-100 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-0 transition"
                        >
                            <SiGoogle className="h-5 w-5 text-white" />
                            Continue with Google
                        </button>
                    </div>

                    {/* Username */}
                    <div className="relative z-0 w-full mb-6 group">
                        <input
                            {...register("username", { required: "Username is required" })}
                            type="text"
                            id="floating_username"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
                            placeholder=" "
                        />
                        <label
                            htmlFor="floating_username"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-blue-600 peer-focus:dark:text-blue-500"
                        >
                            Username
                        </label>
                        {errors.username && (
                            <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
                        )}
                    </div>

                    {/* Email */}
                    <div className="relative z-0 w-full mb-6 group">
                        <input
                            {...register("email", { required: "Email is required" })}
                            type="email"
                            id="floating_email"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
                            placeholder=" "
                        />
                        <label
                            htmlFor="floating_email"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-blue-600 peer-focus:dark:text-blue-500"
                        >
                            Email address
                        </label>
                        {errors.email && (
                            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="relative z-0 w-full mb-6 group">
                        <input
                            {...register("password", { required: "Password is required" })}
                            type={showPassword ? "text" : "password"}
                            // if showPassword is true then type is text else type is password
                            id="floating_password"
                            className="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer dark:text-white dark:border-gray-600 dark:focus:border-blue-500 pr-10" placeholder="" />
                        <label
                            htmlFor="floating_password"
                            className="absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 z-10 origin-[0] peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 peer-focus:text-blue-600 peer-focus:dark:text-blue-500"
                        >
                            Password
                        </label>

                        {/* Toggle Button */}
                        <button
                            type="button"
                            onClick={togglePassword}
                            className="cursor-pointer absolute right-2 top-2.5 text-gray-600 dark:text-gray-300"
                            tabIndex={-1}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>

                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">
                                {errors.password.message}
                            </p>
                        )}
                    </div>


                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer w-full py-2.5 px-4 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800 transition"
                    >
                        {isSubmitting ? "Signing in..." : "Sign in"}
                    </button>

                    {error?.message && (
                        <p className="text-red-600 text-sm mt-1">{error.message}</p>
                    )}
                </form>
            </div>
        </>

    )
}

export default Register