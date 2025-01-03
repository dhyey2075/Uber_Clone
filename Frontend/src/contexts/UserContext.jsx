import React, { createContext, useState } from 'react';

// Create the UserContext
const UserContext = createContext(null);

const UserProvider = ({ children }) => {
    // State to hold user information
    const [user, setUser] = useState({
        firstname: '',
        email: '',
        lastname: '',
    });

    const updateUser = (firstname, lastname, email) => {
        setUser({ 
            firstname: firstname, 
            lastname: lastname, 
            email: email
         });
    };

    return (
        <UserContext.Provider value={{ user, updateUser }}>
            {children}
        </UserContext.Provider>
    );
};

export { UserContext, UserProvider };
