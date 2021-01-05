import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  Ref,
  useEffect,
} from 'react'
import { LeafletMouseEvent, LatLng } from 'leaflet'

import { Marker, useMapEvents } from 'react-leaflet'

function LocationMarker(_props: any, ref: Ref<any>) {
  const [position, setPosition] = useState<LatLng | null>(null)

  useImperativeHandle(ref, () => {
    return {
      position,
    }
  })

  const map = useMapEvents({
    click(e: LeafletMouseEvent) {
      setPosition(e.latlng)
    },
    locationfound(e) {
      setPosition(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    },
  })

  useEffect(() => {
    if (map) {
      map.locate()
    }
  }, [map])

  return position === null ? null : <Marker position={position}></Marker>
}

export default forwardRef(LocationMarker)
