// src/components/Login.js
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import HomeNavigation from './HomeNavigation';
import UserNavigation from './UserNavigation';
const WebNavigation = () => {
  const { user } = useSelector((state) => state.app);

  useEffect(() => {
    // // check user có bị khóa ko
    // callCheckBanUser();
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