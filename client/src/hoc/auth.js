import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { auth } from '../_actions/user_action';

export default function (SpecificComponent, option, adminRoute = null) {    
    // option
    //null: 아무나, true: auth가 있는 유저만, false: auth가 없는 유저만 

    function AuthenticationCheck(props) {
        const dispatch = useDispatch();

        useEffect(() => {

            dispatch(auth()).then(response => {
                console.log(response)                
                
                // 로그인하지 않은 상태
                if(!response.payload.isAuth) {
                    if(option) props.history.push('/login')
                } 
                // 로그인한 상태
                else {
                    // Admin
                    if(adminRoute && !response.payload.isAdmin) props.history.push('/')
                    else {
                        // 출입 불가
                        if(option === false) props.history.push('/')
                    }
                }
            })
        }, [])

        return (
            <SpecificComponent />
        )
    }

    return AuthenticationCheck
}