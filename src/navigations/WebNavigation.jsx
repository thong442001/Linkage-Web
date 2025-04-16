// src/components/Login.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomeNavigation from './HomeNavigation';
import UserNavigation from './UserNavigation';
import {
  getAllReaction,
} from '../rtk/API';
import { setReactions } from '../rtk/Reducer';
const WebNavigation = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.app);

  useEffect(() => {
    //reactions
    callGetAllReaction();
  }, []);

  //call api getAllReaction
  const callGetAllReaction = async () => {
    try {
      await dispatch(getAllReaction())
        .unwrap()
        .then(response => {
          //console.log("****: " + response)
          dispatch(setReactions(response.reactions));
        })
        .catch(error => {
          console.log('Error callGetAllReaction:', error);
        });
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div>
      {
        user ? (
          <HomeNavigation />
        ) : (
          <UserNavigation />
        )
      }
    </div>
  );
};

export default WebNavigation;