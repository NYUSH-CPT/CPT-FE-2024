import React from 'react';
import Link from 'next/link';


const Custom403 = () => {
    return (
        <div>
            <h1>403 - Access Denied</h1>
            <p>Sorry, you do not have permission to access this page.</p>
            <Link href={"/"} className="text-blue-500 underline">
            Return to the main page
            </Link>
        </div>
    );
};

export default Custom403;

