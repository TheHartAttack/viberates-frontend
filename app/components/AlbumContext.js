import React, {useEffect, useContext} from "react"
import {useImmerReducer} from "use-immer"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import AlbumStateContext from "../contexts/AlbumStateContext"
import AlbumDispatchContext from "../contexts/AlbumDispatchContext"
import AlbumReducer from "../reducers/AlbumReducer"

//Components
import Album from "./Album"

function AlbumContext() {
  const appState = useContext(StateContext)
  const initialState = {
    albumData: {},
    loading: true,
    colNum: 1
  }

  const [state, dispatch] = useImmerReducer(AlbumReducer, initialState)

  return (
    <AlbumStateContext.Provider value={state}>
      <AlbumDispatchContext.Provider value={dispatch}>
        <Album />
      </AlbumDispatchContext.Provider>
    </AlbumStateContext.Provider>
  )
}

export default AlbumContext
