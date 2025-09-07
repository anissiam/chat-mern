
import './App.css'
import {BrowserRouter, Navigate, Route, Routes} from "react-router-dom";
import Auth from "@/pages/auth/index.jsx";
import Chat from "@/pages/chat/index.jsx";
import Profile from "@/pages/profile/index.jsx";
import {useAppStore} from "@/store/index.js";
import {useEffect, useState} from "react";
import {apiClient} from "@/lib/api-client.js";
import {GET_USER_INFO} from "@/utils/constants.js";

const PrivateRoute  = ({children}) => {
    const {userInfo} = useAppStore();
    const isAuthenticated = !!userInfo;
    return isAuthenticated ? children : <Navigate to="/auth"/>;
}

const AuthRoute  = ({children}) => {
    const {userInfo} = useAppStore();
    const isAuthenticated = !!userInfo;
    return isAuthenticated ? <Navigate to="/chat"/> :children;
}
function App() {
    const {userInfo , setUserInfo} = useAppStore();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        const getUserData = async () => {
            try {
                const response = await apiClient(GET_USER_INFO,{withCredentials: true});
                if (response.status===200){
                    setUserInfo(response.data.user)
                }else {
                    setUserInfo(undefined)
                }
            }catch (e) {
                setUserInfo(undefined)
                console.log(e)
            }finally {
                setLoading(false);
            }
        }
        if (!userInfo){
            getUserData();
        }else {
            setLoading(false);
        }
    }, [userInfo, setUserInfo]);
    if (loading){
        return <div>Loading...</div>
    }
    return (
        <div>
            {<BrowserRouter>
                <Routes>
                    <Route path="/auth" element={<AuthRoute><Auth/></AuthRoute>}/>
                    <Route path="/chat" element={<PrivateRoute><Chat/> </PrivateRoute>}/>
                        <Route path="/profile" element={<PrivateRoute><Profile/> </PrivateRoute>}/>
                        <Route path="*" element={<Navigate to="/auth"/>}/>
                </Routes>
            </BrowserRouter>}
        </div>
    );
}

export default App
