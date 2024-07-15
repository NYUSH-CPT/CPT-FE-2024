import React from 'react';
import Link from 'next/link';

const Custom401 = () => {
    return (
        <div>
            <h1>401 - Unauthorized</h1>
            <p>Sorry, you do not have permission to access this page.</p>
            <Link href={"/"} className="text-blue-500 underline">
            Return to the main page
            </Link>
        </div>
    );
};

export default Custom401;
