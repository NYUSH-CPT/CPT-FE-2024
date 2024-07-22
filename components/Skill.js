import { useState } from 'react'

import Drawer from '@mui/material/Drawer'
import CloseIcon from '@mui/icons-material/Close';

import styles from '@/styles/skill.module.scss'

import { CHALLENGE_WRITING_SAMPLE, CHALLENGE_WRITING_SKILLS } from "./text"

export default function Skill() {

    const [state, setState] = useState({
        left: false,
        right: false,
      });

      const handleClick = (anchor, open) => (event) => {
        setState({ ...state, [anchor]: open });
      };


    return (
        <div className={styles.skill}>

            <div onClick={handleClick("left", true)}
            className='flex w-1/2 justify-center items-center border-r py-3'>
                <h2>练习举例</h2>
            </div>
            
            <div onClick={handleClick("right", true)}
            className='flex w-1/2 justify-center items-center py-3'>
                <h2>技能回顾</h2>
            </div>

            <Drawer anchor='left' open={state['left']} onClose={handleClick('left', false)}>
            <div className="relative w-full h-full p-4">
                <CloseIcon 
                    onClick={handleClick('left', false)} 
                    className="fixed top-4 left-4 cursor-pointer z-10"
                />
                {CHALLENGE_WRITING_SAMPLE}
            </div>
            </Drawer>

            <Drawer anchor='right' open={state['right']} onClose={handleClick('right', false)}>
                <div className="relative w-full h-full p-4">
                    <CloseIcon 
                        onClick={handleClick('right', false)} 
                        className="cursor-pointer"
                    />
                    <div className={`p-4 ${styles.article}`}>

                    {CHALLENGE_WRITING_SKILLS}
                    </div>
                </div>
            </Drawer>
        </div>  
    )
}
