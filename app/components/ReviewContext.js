import React from "react"
import {useImmerReducer} from "use-immer"

//Contexts & Reducers
import ReviewStateContext from "../contexts/ReviewStateContext"
import ReviewDispatchContext from "../contexts/ReviewDispatchContext"
import ReviewReducer from "../reducers/ReviewReducer"

//Components
import Review from "./Review"

function ReviewContext() {
  const initialState = {
    isLoading: true,
    reviewData: {
      likes: []
    }
  }

  const [state, dispatch] = useImmerReducer(ReviewReducer, initialState)

  return (
    <ReviewStateContext.Provider value={state}>
      <ReviewDispatchContext.Provider value={dispatch}>
        <Review />
      </ReviewDispatchContext.Provider>
    </ReviewStateContext.Provider>
  )
}

export default ReviewContext
