import React, {
  FC,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
  ChangeEvent,
  FormEvent,
} from 'react'
import { Link, useHistory } from 'react-router-dom'
import { FiArrowLeft } from 'react-icons/fi'
import { MapContainer, TileLayer } from 'react-leaflet'

import api from '../../services/api'

import logo from '../../assets/logo.svg'
import './styles.css'
import axios from 'axios'
import LocationMarker from '../../components/LocationMarker'

interface Items {
  title: string
  image_url: string
  id: number
}

interface UF {
  sigla: string
  nome: string
  id: number
}
interface City {
  nome: string
  id: number
}

export const CreatePoint: FC = () => {
  const [items, setItems] = useState<Items[]>([])
  const [UFs, setUFs] = useState<UF[]>([])
  const [cities, setCities] = useState<City[]>([])
  const locationMarkerRef = useRef({ position: { lat: 0, lng: 0 } })

  const history = useHistory()

  // Form data: /////
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [selectedUf, setSelectedUf] = useState<string>('0')
  const [selectedCity, setSelectedCity] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  })

  const position = useMemo(() => {
    if (locationMarkerRef.current.position) {
      return locationMarkerRef.current.position
    }
    return null
  }, [locationMarkerRef])
  /////////////////
  useEffect(() => {
    api
      .get('items')
      .then(response => {
        setItems(response.data)
      })
      .catch(e => console.log(e))
  }, [])

  useEffect(() => {
    axios
      .get('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response => {
        setUFs(response.data)
      })
      .catch(err => console.log(err))
  }, [])

  useEffect(() => {
    if (selectedUf === '0') return
    axios
      .get(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`,
      )
      .then(response => {
        setCities(response.data)
      })
      .catch(err => console.log(err))
  }, [selectedUf, locationMarkerRef])

  const handleSelectUf = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setCities([])
      setSelectedUf(event.target.value)
    },
    [],
  )

  const handleSelectCity = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      setSelectedCity(event.target.value)
    },
    [],
  )

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      setFormData({
        ...formData,
        [event.target.name]: event.target.value,
      })
    },
    [formData],
  )

  const handleSelectItem = useCallback(
    (id: number) => {
      const alreadySelected = selectedItems.findIndex(item => item === id)

      if (alreadySelected >= 0) {
        const filteredItems = selectedItems.filter(item => item !== id)
        setSelectedItems(filteredItems)
      } else {
        setSelectedItems([...selectedItems, id])
      }
    },
    [selectedItems],
  )

  const handleSubmit = useCallback(
    async (event: FormEvent) => {
      event.preventDefault()

      const data = {
        name: formData.name,
        email: formData.email,
        whatsapp: formData.whatsapp,
        latitude: position?.lat,
        longitude: position?.lng,
        city: selectedCity,
        uf: selectedUf,
        items: selectedItems,
      }

      await api.post('points', data)

      alert('Ponto de coleta criado')

      history.replace('/')
    },
    [formData, selectedItems, selectedCity, selectedUf, position, history],
  )

  const enableSelection = useMemo(() => {
    const verify = Number(selectedUf)
    return !isNaN(verify)
  }, [selectedUf])

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />

        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Dados</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              onChange={handleInputChange}
              type="text"
              name="name"
              id="name"
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                onChange={handleInputChange}
                type="email"
                name="email"
                id="email"
              />
            </div>
            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                onChange={handleInputChange}
                type="text"
                name="whatsapp"
                id="whatsapp"
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>
          <MapContainer
            center={[-28.4899659, -49.0312173]}
            zoom={13}
            scrollWheelZoom
          >
            <TileLayer
              attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker ref={locationMarkerRef} />
          </MapContainer>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                onChange={handleSelectUf}
                value={selectedUf}
                name="uf"
                id="uf"
              >
                <option value="0">Selecione uma UF</option>
                {UFs &&
                  UFs.map(UF => (
                    <option key={UF.id} value={UF.sigla}>
                      {UF.nome} ( {UF.sigla} )
                    </option>
                  ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                onChange={handleSelectCity}
                value={selectedCity}
                disabled={enableSelection}
                name="city"
                id="city"
              >
                <option value="0">Selecione uma cidade</option>
                {cities &&
                  cities.map(city => (
                    <option key={city.id} value={city.nome}>
                      {city.nome}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {items &&
              items.map(item => (
                <li
                  className={selectedItems.includes(item.id) ? 'selected' : ''}
                  onClick={() => handleSelectItem(item.id)}
                  key={item.id}
                >
                  <img src={item.image_url} alt={item.title} />
                  <span>{item.title}</span>
                </li>
              ))}
          </ul>
        </fieldset>

        <button disabled={!selectedCity} type="submit">
          Cadastrar ponto de coleta
        </button>
      </form>
    </div>
  )
}
