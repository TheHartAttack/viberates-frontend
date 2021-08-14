import React, {useEffect, useContext} from "react"
import {Link} from "react-router-dom"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faTimes, faSearch, faArrowRight} from "@fortawesome/free-solid-svg-icons"

//Contexts
import DispatchContext from "../contexts/DispatchContext"

//Components
import Loading from "./Loading"
import AlbumTile from "./AlbumTile"
import ArtistTile from "./ArtistTile"
import UserTile from "./UserTile"

function Search() {
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    searchTerm: "",
    results: {},
    loading: false,
    requestCount: 0
  })

  useEffect(() => {
    document.addEventListener("keyup", searchKeypressHandler)
    return () => {
      document.removeEventListener("keyup", searchKeypressHandler)
    }
  }, [])

  useEffect(() => {
    if (state.searchTerm.trim()) {
      setState(draft => {
        draft.loading = true
      })
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 500)

      return () => clearTimeout(delay)
    } else {
      setState(draft => {
        draft.loading = false
      })
    }
  }, [state.searchTerm])

  useEffect(() => {
    if (state.requestCount) {
      async function fetchResults() {
        cancelPreviousRequest()
        try {
          const response = await Axios.post("/search", {searchTerm: state.searchTerm}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            setState(draft => {
              draft.results = {
                artists: response.data.artists,
                albums: response.data.albums,
                users: response.data.users
              }
              draft.loading = false
            })
          } else {
            throw new Error(response.data.message)
          }
        } catch (e) {
          if (isCancel(e)) {
            console.log(e)
            return
          }
          appDispatch({type: "flashMessage", value: e.message, warning: true})
          console.log(e)
          setState(draft => {
            draft.loading = false
          })
        }
      }
      fetchResults()
    }
  }, [state.requestCount])

  function searchKeypressHandler(e) {
    if (e.keyCode == 27) {
      appDispatch({type: "closeSearch"})
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <>
      <div className="search__header">
        <span className="search__icon search__icon--search">
          <FontAwesomeIcon icon={faSearch} />
        </span>
        <input onChange={handleInput} autoFocus autoComplete="off" type="text" className="search__input" id="search__input" />
        <a
          href="#"
          className="search__close"
          onClick={e => {
            e.preventDefault()
            appDispatch({type: "closeSearch"})
          }}
        >
          <FontAwesomeIcon icon={faTimes} />
        </a>
      </div>

      {state.loading && <Loading className="grey" />}

      {!state.loading && state.requestCount && state.searchTerm.trim() && (
        <div className="search__results">
          <div className="search__section search__section--artists">
            <h3 className="search__title">Artists</h3>
            {Boolean(state.results.artists.length) &&
              state.results.artists.map(artist => {
                return <ArtistTile artist={artist} key={artist._id} />
              })}
            {!Boolean(state.results.artists.length) && <span className="search__none">No results found.</span>}
            <Link onClick={() => appDispatch({type: "closeSearch"})} to="/add-artist" className="search__button">
              <span className="button">
                Add artist to database <FontAwesomeIcon icon={faArrowRight} />
              </span>
            </Link>
          </div>

          <div className="search__section search__section--albums">
            <h3 className="search__title">Albums</h3>
            {Boolean(state.results.albums.length) &&
              state.results.albums.map(album => {
                return <AlbumTile album={album} key={album._id} />
              })}
            {!Boolean(state.results.albums.length) && <span className="search__none">No results found.</span>}
          </div>

          <div className="search__section search__section--users">
            <h3 className="search__title">Users</h3>
            {Boolean(state.results.users.length) &&
              state.results.users.map(user => {
                return <UserTile user={user} key={user._id} />
              })}
            {!Boolean(state.results.users.length) && <span className="search__none">No results found.</span>}
          </div>
        </div>
      )}
    </>
  )
}

export default Search
