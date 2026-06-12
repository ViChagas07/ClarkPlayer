'use client'

import { useCallback, useRef } from 'react'
import { useGoogleScripts, GOOGLE_CLIENT_ID, GOOGLE_API_KEY } from '@/hooks/useGoogleScripts'

/**
 * Hooks into the Google Picker API to let the user select image files from
 * their Google Drive.
 *
 * Returns:
 * • `openPicker()` – opens the Drive file picker (call from a button click).
 * • `ready` / `loading` / `error` – script readiness flags.
 * • `pickerVisible` – true while the picker iframe is open.
 *
 * When the user selects a file the hook downloads it and calls `onFilePicked(file)`.
 */

const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.readonly'

// Pick a real recognised MIME type so the downloaded Blob is usable
function extensionToMime(ext: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp',
    bmp: 'image/bmp',
    svg: 'image/svg+xml',
  }
  return map[ext.toLowerCase()] ?? 'image/png'
}

interface UseGooglePickerOptions {
  onFilePicked: (file: File) => void
  onError?: (message: string) => void
}

interface UseGooglePickerResult {
  openPicker: () => void
  ready: boolean
  loading: boolean
  error: string | null
  pickerVisible: boolean
}

export function useGooglePicker({ onFilePicked, onError }: UseGooglePickerOptions): UseGooglePickerResult {
  const { ready, loading, error } = useGoogleScripts()
  const pickerVisibleRef = useRef(false)
  const callbackRef = useRef({ onFilePicked, onError })
  callbackRef.current = { onFilePicked, onError }

  const openPicker = useCallback(() => {
    if (!ready) {
      onError?.('Google APIs are not loaded yet. Please wait a moment and try again.')
      return
    }

    const tokenClient = (window as unknown as {
      google?: {
        accounts?: {
          oauth2?: {
            initTokenClient: (config: {
              client_id: string
              scope: string
              callback: (response: { access_token?: string; error?: string }) => void
            }) => {
              requestAccessToken: () => void
            }
          }
        }
      }
    }).google?.accounts?.oauth2

    const gapi = (window as unknown as {
      gapi?: {
        load: (api: string, cb: { callback: () => void }) => void
      }
    }).gapi

    if (!tokenClient || !gapi) {
      callbackRef.current.onError?.('Google authentication not available. Please sign in and try again.')
      return
    }

    const client = tokenClient.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: DRIVE_SCOPE,
      callback: (tokenResponse) => {
        if (tokenResponse.error !== undefined) {
          callbackRef.current.onError?.('Failed to get Drive access. Please try again.')
          return
        }

        const accessToken = tokenResponse.access_token
        if (!accessToken || !GOOGLE_API_KEY) return

        // Build the Picker

        // ── Google Picker type declarations (not available from npm) ──
        interface GooglePickerBuilder {
          addView: (view: unknown) => GooglePickerBuilder
          setOAuthToken: (token: string) => GooglePickerBuilder
          setDeveloperKey: (key: string) => GooglePickerBuilder
          setCallback: (cb: (data: GooglePickerResponse) => void) => GooglePickerBuilder
          build: () => GooglePickerInstance
          enableFeature: (feature: unknown) => GooglePickerBuilder
        }
        interface GooglePickerInstance {
          setVisible: (v: boolean) => void
        }
        interface GooglePickerResponse {
          action: string
          docs?: Array<{
            id: string
            name: string
            mimeType: string
            url?: string
            sizeBytes?: string
          }>
        }
        interface GooglePickerNamespace {
          View: new (viewId: string) => GooglePickerView
          DocsView: new () => GooglePickerView
          PickerBuilder: new () => GooglePickerBuilder
          Feature: { MULTISELECT_ENABLED: unknown; NAV_HIDDEN: unknown }
          Action: { PICKED: string; CANCEL: string }
        }
        interface GooglePickerView {
          setMimeTypes: (types: string) => void
          setIncludeFolders: (v: boolean) => void
          setSelectFolderEnabled: (v: boolean) => void
        }

        const google = (window as unknown as { google: { picker: GooglePickerNamespace } }).google

        const view = new google.picker.DocsView()
        view.setIncludeFolders(false)
        view.setMimeTypes('image/png,image/jpeg,image/webp,image/gif,image/bmp,image/svg+xml')
        view.setSelectFolderEnabled(false)

        const builder = new google.picker.PickerBuilder()
          .addView(view)
          .setOAuthToken(accessToken)
          .setDeveloperKey(GOOGLE_API_KEY)
          .setCallback(async (data) => {
            if (data.action === google.picker.Action.PICKED && data.docs?.[0]) {
              const doc = data.docs[0]
              pickerVisibleRef.current = false

              // Download the file bytes using Drive API
              try {
                const response = await fetch(
                  `https://www.googleapis.com/drive/v3/files/${doc.id}?alt=media`,
                  { headers: { Authorization: `Bearer ${accessToken}` } },
                )

                if (!response.ok) throw new Error(`Download failed (${response.status})`)

                const blob = await response.blob()
                const ext = doc.name.split('.').pop() ?? 'png'
                const file = new File([blob], doc.name, { type: blob.type || extensionToMime(ext) })
                callbackRef.current.onFilePicked(file)
              } catch (downloadErr) {
                callbackRef.current.onError?.(
                  `Failed to download image from Drive: ${downloadErr instanceof Error ? downloadErr.message : 'Unknown error'}`,
                )
              }
            }

            if (data.action === google.picker.Action.CANCEL) {
              pickerVisibleRef.current = false
            }
          })
          .enableFeature(google.picker.Feature.MULTISELECT_ENABLED)

        const picker = builder.build()
        picker.setVisible(true)
        pickerVisibleRef.current = true
      },
    })

    client.requestAccessToken()
  }, [ready, onError])

  return { openPicker, ready, loading, error, pickerVisible: pickerVisibleRef.current }
}
