function artistProfileReducer(draft, action) {
  switch (action.type) {
    case "startLoading":
      draft.isLoading = true
      return

    case "finishLoading":
      draft.isLoading = false
      return

    case "setArtistName":
      draft.artistData.name = action.data
      return

    case "setArtistSlug":
      draft.artistData.slug = action.data
      return

    case "setArtistPreview":
      draft.artistData.preview = action.data
      return

    case "setArtistImage":
      draft.artistData.image = action.data
      return

    case "startEditing":
      draft.edit.active = true
      return

    case "finishEditing":
      draft.edit.active = false
      return

    case "submit":
      draft.edit.submitCount++
      return

    case "startSubmitting":
      draft.edit.submitting = true
      return

    case "finishSubmitting":
      draft.edit.submitting = false
      return

    case "delete":
      draft.edit.deleteCount++
      return

    case "startDeleting":
      draft.edit.deleting = true
      return

    case "finishDeleting":
      draft.edit.deleting = false
      return

    case "setEditName":
      draft.edit.name = action.data
      return

    case "setEditPreview":
      draft.edit.preview = action.data
      return

    case "setEditImage":
      draft.edit.image = action.data
      return
  }
}

export default artistProfileReducer
