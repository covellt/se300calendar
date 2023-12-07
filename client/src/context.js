import React from "react";

const AuthContext = React.createContext({ isSignedIn: false});

const AuthProvider = ({ children }) => {
    const [isSignedIn, setIsSignedIn] = React.useState(false);

    return (
        <AuthContext.Provider value={{ isSignedIn, setIsSignedIn}}>
            {children}
        </AuthContext.Provider>
    )
}
export { AuthContext, AuthProvider}