export interface ResponseList<T> {
  status: number
  message: string
  data: T[]
}

export interface ResponseDetail<T> {
  status: number
  message: string
  data: T
}

export interface Station {
  sta_id: string
  sta_name: string
  group_wil: number
  fg_enable: number
}


export interface Train {
  train_id: string
  ka_name: string
  route_name: string
  dest: string
  time_est: string
  color: string
  dest_time: string
}


export interface Lane {
  train_id: string
  ka_name: string
  station_id: string
  station_name: string
  time_est: string
  transit_station: boolean
  color: string
  transit: any
}
