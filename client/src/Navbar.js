import React, { useContext } from 'react'
import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import { AuthContext } from './context.js';

const Navbar = () => {
    const {isSignedIn, setIsSignedIn} = React.useContext(AuthContext);

    // Function to handle sign-out
    const handleSignOut = () => {
        firebase.auth().signOut();
    };

    // Function to handle account deletion
    const handleDeleteAccount = () => {
    const user = firebase.auth().currentUser;

    if (user) {
      user.delete()
        .then(() => {
          console.log("User account deleted successfully.");
          setIsSignedIn(false);
        })
        .catch(error => {
          console.error("Error deleting user account:", error);
        });
    }
  };

    return (
        <ul>
          {!isSignedIn ? (<li>
          <a href="#" className="button"
            onClick={(e) => { e.preventDefault(); handleSignOut(); }}
            style={{
              borderColor: '#737373',
              backgroundColor: '#595959',
              color: '#ffffff', // Text color
              padding: '0px 16px', // Padding for better appearance
              textDecoration: 'none', // Remove underline
              borderRadius: '4px', // Rounded corners
              display: 'inline-block', // Inline block for proper spacing
            }}
          >
            Sign Out
          </a>
        </li>) : (<div></div>)}
        {!isSignedIn ? (<li>
          <a href="#" className="button"
            onClick={(e) => { e.preventDefault(); handleDeleteAccount(); }}
            style={{
              borderColor: '#737373',
              backgroundColor: '#595959',
              color: '#ffffff', // Text color
              padding: '0px 16px', // Padding for better appearance
              textDecoration: 'none', // Remove underline
              borderRadius: '4px', // Rounded corners
              display: 'inline-block', // Inline block for proper spacing
              marginTop: '10px' // Add margin-top for separation
            }}
          >
            Delete Account
          </a>
        </li>) : (<div></div>)}
      </ul>
    )
}

export default Navbar;
