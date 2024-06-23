import React from 'react';
import Link from 'next/link';

const Custom400 = () => {
    return (
        <div>
            <h1>400 - Bad Request</h1>
            <p>Your request was invalid.</p>
            <Link href={"/"} className="text-blue-500 underline">
            Return to the main page
            </Link>
        </div>
    );
};

export default Custom400;
