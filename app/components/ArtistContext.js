import React, {useEffect, useContext, Suspense} from "react"
import {useImmerReducer} from "use-immer"
import {CSSTransition} from "react-transition-group"

//Contexts & Reducers
import StateContext from "../contexts/StateContext"
import ArtistStateContext from "../contexts/ArtistStateContext"
import ArtistDispatchContext from "../contexts/ArtistDispatchContext"
import ArtistReducer from "../reducers/ArtistReducer"

//Components
import Artist from "./Artist"
import AddAlbum from "./AddAlbum"

function ArtistContext() {
  const appState = useContext(StateContext)
  const initialState = {
    artistData: {},
    loading: true,
    addAlbum: {
      active: false,
      title: "",
      image: null,
      preview: null,
      releaseDate: new Date(),
      type: "Studio",
      tracklist: [],
      submitting: false,
      submitCount: 0
    }
  }

  const [state, dispatch] = useImmerReducer(ArtistReducer, initialState)

  useEffect(() => {
    if (state.addAlbum.active) {
      document.querySelector("body").classList.add("noscroll")
    } else {
      document.querySelector("body").classList.remove("noscroll")
    }
  }, [state.addAlbum.active])

  return (
    <ArtistStateContext.Provider value={state}>
      <ArtistDispatchContext.Provider value={dispatch}>
        <Artist />
        <CSSTransition timeout={250} in={state.addAlbum.active} classNames="add-album" unmountOnExit>
          <div className="add-album">
            <Suspense fallback="">
              <AddAlbum />
            </Suspense>
          </div>
        </CSSTransition>
      </ArtistDispatchContext.Provider>
    </ArtistStateContext.Provider>
  )
}

export default ArtistContext
