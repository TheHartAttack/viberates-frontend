import React, {useEffect, useContext} from "react"
import {useParams} from "react-router-dom"
import {useImmer} from "use-immer"
import Axios from "axios"
import useCancelToken from "react-use-cancel-token"

//Contexts
import DispatchContext from "../contexts/DispatchContext"

//Components
import Loading from "./Loading"
import Page from "./Page"
import AlbumTile from "./AlbumTile"

function Tag() {
  const appDispatch = useContext(DispatchContext)
  const {newCancelToken, cancelPreviousRequest, isCancel} = useCancelToken()
  const {tag} = useParams()
  const [state, setState] = useImmer({
    tag: {},
    albums: [],
    moreAlbums: false,
    loading: true,
    albumsLoading: false,
    buttonLoading: false,
    option: "top"
  })

  useEffect(() => {
    async function initialLoad() {
      cancelPreviousRequest()
      try {
        setState(draft => {
          draft.loading = true
        })
        const response = await Axios.post(`/tag/${tag}`, {option: state.option, offset: 0}, {cancelToken: newCancelToken()})

        console.log(response.data)

        if (response.data.success) {
          //Format date
          response.data.albums.map(album => {
            album.releaseDate = new Date(album.releaseDate)
          })

          setState(draft => {
            draft.tag = response.data.tag
            draft.albums = response.data.albums
            draft.moreAlbums = response.data.moreAlbums
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
    initialLoad()
  }, [])

  useEffect(() => {
    if (!state.loading) {
      async function getAlbums() {
        cancelPreviousRequest()
        try {
          setState(draft => {
            draft.albumsLoading = true
          })
          const response = await Axios.post(`/tag/${tag}`, {option: state.option, offset: 0}, {cancelToken: newCancelToken()})

          if (response.data.success) {
            //Format date
            response.data.albums.map(album => {
              album.releaseDate = new Date(album.releaseDate)
            })

            setState(draft => {
              draft.tag = response.data.tag
              draft.albums = response.data.albums
              draft.moreAlbums = response.data.moreAlbums
              draft.albumsLoading = false
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
            draft.albumsLoading = false
          })
        }
      }
      getAlbums()
    }
  }, [state.option])

  if (state.loading) {
    return (
      <Page title="...">
        <Loading />
      </Page>
    )
  }

  if (!state.loading && !state.tag) {
    return (
      <Page title="...">
        <div className="tag">
          <span className="tag__none">Tag not found.</span>
        </div>
      </Page>
    )
  }

  return (
    <Page title={`${state.option == "top" ? "Top" : "Latest"} ${state.tag.name} Albums`}>
      <div className="tag">
        <div className="tag__header">
          <h2 className="tag__title">Genre Tag: {state.tag.name}</h2>
          <select
            className="tag__select"
            defaultValue="top"
            onChange={e => {
              setState(draft => {
                draft.option = e.target.value
              })
            }}
          >
            <option value="top">Top rated</option>
            <option value="new">New releases</option>
          </select>
        </div>

        {state.albumsLoading && <Loading />}

        {!state.loading && !state.albumsLoading && !state.albums.length && (
          <div className="tag__none">
            <span>No {state.tag.name.toLowerCase()} albums found.</span>
          </div>
        )}

        {!state.loading && !state.albumsLoading && (
          <div className="tag__body">
            {state.albums.map(album => {
              return <AlbumTile album={album} key={album._id} />
            })}
          </div>
        )}

        {state.moreAlbums && (
          <button onClick={loadMore} className="top-rated__more" disabled={state.buttonLoading}>
            {state.buttonLoading ? <Loading fontSize="14" /> : "Load more"}
          </button>
        )}
      </div>
    </Page>
  )
}

export default Tag
