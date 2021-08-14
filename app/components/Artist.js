import React, {useEffect, useContext} from "react"
import {Link, Redirect, useParams} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import ArtistProfile from "./ArtistProfile"

function Artist() {
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const [state, setState] = useImmer({
    artistData: {},
    loading: true
  })

  useEffect(() => {
    async function getArtist() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get(`/artist/${artist}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          setState(draft => {
            draft.artistData = response.data.artist
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
        setState(draft => {
          draft.loading = false
        })
        console.log(e)
      }
    }
    getArtist()
  }, [])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  if (!state.loading && !state.artistData) {
    return <Redirect to="/" />
  }

  return (
    <Page title={state.artistData.name}>
      <ArtistProfile artistData={state.artistData} artist={artist} page="artist" />

      <div className="artist-albums">
        {!state.artistData.albums.length && <span>No albums in database.</span>}

        {Boolean(
          state.artistData.albums.filter(album => {
            return album.type == "Studio"
          }).length
        ) && (
          <div className="artist-albums__section">
            <h3 className="artist-albums__section-title">Studio</h3>
            {state.artistData.albums
              ? state.artistData.albums.map(album => {
                  if (album.type == "Studio") {
                    return (
                      <Link to={`/music/${state.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
                        {Boolean(album.image) ? (
                          <img className="artist-albums__image" src={album.image} />
                        ) : (
                          <div className="artist-albums__no-image">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                        <div className="artist-albums__info">
                          <span className="artist-albums__title">{album.title}</span>
                          <span className="artist-albums__date">{new Date(album.releaseDate).getFullYear()}</span>
                          <span className="artist-albums__rating">{album.rating ? album.rating : "-"}</span>
                        </div>
                      </Link>
                    )
                  }
                })
              : ""}
          </div>
        )}

        {Boolean(
          state.artistData.albums.filter(album => {
            return album.type == "EP"
          }).length
        ) && (
          <div className="artist-albums__section">
            <h3 className="artist-albums__section-title">EP</h3>
            {state.artistData.albums
              ? state.artistData.albums.map(album => {
                  if (album.type == "EP") {
                    return (
                      <Link to={`/music/${state.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
                        {Boolean(album.image) ? (
                          <img className="artist-albums__image" src={album.image} />
                        ) : (
                          <div className="artist-albums__no-image">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                        <div className="artist-albums__info">
                          <span className="artist-albums__title">{album.title}</span>
                          <span className="artist-albums__date">{new Date(album.releaseDate).getFullYear()}</span>
                          <span className="artist-albums__rating">{album.rating ? album.rating : "-"}</span>
                        </div>
                      </Link>
                    )
                  }
                })
              : ""}
          </div>
        )}

        {Boolean(
          state.artistData.albums.filter(album => {
            return album.type == "Live"
          }).length
        ) && (
          <div className="artist-albums__section">
            <h3 className="artist-albums__section-title">Live</h3>
            {state.artistData.albums
              ? state.artistData.albums.map(album => {
                  if (album.type == "Live") {
                    return (
                      <Link to={`/music/${state.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
                        {Boolean(album.image) ? (
                          <img className="artist-albums__image" src={album.image} />
                        ) : (
                          <div className="artist-albums__no-image">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                        <div className="artist-albums__info">
                          <span className="artist-albums__title">{album.title}</span>
                          <span className="artist-albums__date">{new Date(album.releaseDate).getFullYear()}</span>
                          <span className="artist-albums__rating">{album.rating ? album.rating : "-"}</span>
                        </div>
                      </Link>
                    )
                  }
                })
              : ""}
          </div>
        )}

        {Boolean(
          state.artistData.albums.filter(album => {
            return album.type == "Compilation"
          }).length
        ) && (
          <div className="artist-albums__section">
            <h3 className="artist-albums__section-title">Compilations</h3>
            {state.artistData.albums
              ? state.artistData.albums.map(album => {
                  if (album.type == "Compilation") {
                    return (
                      <Link to={`/music/${state.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
                        {Boolean(album.image) ? (
                          <img className="artist-albums__image" src={album.image} />
                        ) : (
                          <div className="artist-albums__no-image">
                            <FontAwesomeIcon icon={faImage} />
                          </div>
                        )}
                        <div className="artist-albums__info">
                          <span className="artist-albums__title">{album.title}</span>
                          <span className="artist-albums__date">{new Date(album.releaseDate).getFullYear()}</span>
                          <span className="artist-albums__rating">{album.rating ? album.rating : "-"}</span>
                        </div>
                      </Link>
                    )
                  }
                })
              : ""}
          </div>
        )}
      </div>
    </Page>
  )
}

export default Artist
