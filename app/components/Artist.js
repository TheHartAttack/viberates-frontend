import React, {useEffect, useContext} from "react"
import {Link, Redirect, useParams, withRouter} from "react-router-dom"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"
import {useImmer} from "use-immer"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {faImage} from "@fortawesome/free-solid-svg-icons"

//Contexts
import StateContext from "../contexts/StateContext"
import DispatchContext from "../contexts/DispatchContext"
import ArtistStateContext from "../contexts/ArtistStateContext"
import ArtistDispatchContext from "../contexts/ArtistDispatchContext"

//Components
import Page from "./Page"
import Loading from "./Loading"
import ArtistProfileContext from "./ArtistProfileContext"

function Artist(props) {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const artistState = useContext(ArtistStateContext)
  const artistDispatch = useContext(ArtistDispatchContext)
  const {artist} = useParams()
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()

  useEffect(() => {
    async function getArtist() {
      cancelPreviousRequest()

      try {
        const response = await Axios.get(`/artist/${artist}`, {cancelToken: newCancelToken()})

        if (response.data.success) {
          artistDispatch({type: "setArtistData", data: response.data.artist})
          artistDispatch({type: "finishLoading"})
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
        props.history.push(`/`)
      }
    }
    getArtist()
  }, [artist])

  if (artistState.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  return (
    <Page title={artistState.artistData.name}>
      <ArtistProfileContext artistData={artistState.artistData} artist={artist} page="artist" />

      <div className="artist__content">
        <div className="artist-albums">
          {!artistState.artistData.albums.length && <span>No albums in database.</span>}

          {Boolean(
            artistState.artistData.albums.filter(album => {
              return album.type == "Studio"
            }).length
          ) && (
            <div className="artist-albums__section">
              <h3 className="artist-albums__section-title">Studio Albums</h3>
              {artistState.artistData.albums
                ? artistState.artistData.albums.map(album => {
                    if (album.type == "Studio") {
                      return (
                        <Link to={`/music/${artistState.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
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
            artistState.artistData.albums.filter(album => {
              return album.type == "EP"
            }).length
          ) && (
            <div className="artist-albums__section">
              <h3 className="artist-albums__section-title">EP</h3>
              {artistState.artistData.albums
                ? artistState.artistData.albums.map(album => {
                    if (album.type == "EP") {
                      return (
                        <Link to={`/music/${artistState.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
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
            artistState.artistData.albums.filter(album => {
              return album.type == "Live"
            }).length
          ) && (
            <div className="artist-albums__section">
              <h3 className="artist-albums__section-title">Live</h3>
              {artistState.artistData.albums
                ? artistState.artistData.albums.map(album => {
                    if (album.type == "Live") {
                      return (
                        <Link to={`/music/${artistState.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
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
            artistState.artistData.albums.filter(album => {
              return album.type == "Compilation"
            }).length
          ) && (
            <div className="artist-albums__section">
              <h3 className="artist-albums__section-title">Compilations</h3>
              {artistState.artistData.albums
                ? artistState.artistData.albums.map(album => {
                    if (album.type == "Compilation") {
                      return (
                        <Link to={`/music/${artistState.artistData.slug}/${album.slug}`} className="artist-albums__album" key={album._id}>
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
      </div>
    </Page>
  )
}

export default withRouter(Artist)
