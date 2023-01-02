function artistReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.isLoading = true
      return

    case "finishLoading":
      draft.isLoading = false
      return

    case "setArtistData":
      draft.artistData = action.data
      draft.loading = false
      return

    case "setArtistName":
      draft.artistData.name = action.data
      return

    case "setArtistPreview":
      draft.artistData.preview = action.data
      return

    case "setArtistImage":
      draft.artistData.image = action.data
      return

    case "startAddAlbum":
      draft.addAlbum.active = true
      return

    case "finishAddAlbum":
      draft.addAlbum.active = false
      draft.addAlbum.title = ""
      draft.addAlbum.type = "Studio"
      draft.addAlbum.releaseDate = new Date()
      draft.addAlbum.image = null
      draft.addAlbum.preview = null
      return

    case "submit":
      draft.addAlbum.submitCount++
      return

    case "startSubmitting":
      draft.addAlbum.submitting = true
      return

    case "finishSubmitting":
      draft.addAlbum.submitting = false
      return

    case "setAddAlbumTitle":
      draft.addAlbum.title = action.data
      return

    case "setAddAlbumReleaseDate":
      draft.addAlbum.releaseDate = action.data
      return

    case "setAddAlbumType":
      draft.addAlbum.type = action.data
      return

    case "setAddAlbumPreview":
      draft.addAlbum.preview = action.data
      return

    case "setAddAlbumImage":
      draft.addAlbum.image = action.data
      return

    case "setAddAlbumTracklist":
      draft.addAlbum.tracklist = action.data
      return

    case "addAlbumTracklistAdd":
      draft.addAlbum.tracklist.push(action.data)
      return

    case "addAlbumTracklistRemove":
      draft.addAlbum.tracklist.splice(action.data, 1)
      return

    case "addAlbumTracklistReorder":
      const [track] = draft.addAlbum.tracklist.splice(action.sourceIndex, 1)
      draft.addAlbum.tracklist.splice(action.destIndex, 0, track)
      return
  }
}

export default artistReducer
