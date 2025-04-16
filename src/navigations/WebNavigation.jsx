// src/components/Login.js
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomeNavigation from './HomeNavigation';
import UserNavigation from './UserNavigation';
import {
  getAllReaction,
  getAllReason
} from '../rtk/API';
import { setReactions, setReasons } from '../rtk/Reducer';
const WebNavigation = () => {
  const dispatch = useDispatch();
  const { user, token } = useSelector((state) => state.app);

  useEffect(() => {
    if (user) {
      //reactions
      callGetAllReaction();
      //reasons
      callGetAllReason();
    }
  }, [user]);

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

  //call api getAllReaction
  const callGetAllReason = async () => {
    try {
      await dispatch(getAllReason({ token: token }))
        .unwrap()
        .then(response => {
          //console.log("****: " + response)
          dispatch(setReasons(response.reasons));
        })
        .catch(error => {
          console.log('Error callGetAllReason:', error);
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