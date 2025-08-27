import { defHttp } from '~/utils/http'

export interface Winner {
  id: number
  name: string
  competition: string
  award: string
  avatar: string
  createdAt: string
}

export interface CreateWinnerDto {
  name: string
  competition: string
  award: string
  avatar?: string
}

export interface UpdateWinnerDto {
  name?: string
  competition?: string
  award?: string
  avatar?: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
  name?: string
  competition?: string
  award?: string
}

export interface PaginationResult<T> {
  winners: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface WinnerStats {
  totalWinners: number
  awardStats: Array<{
    award: string
    _count: {
      award: number
    }
  }>
  competitionStats: Array<{
    competition: string
    _count: {
      competition: number
    }
  }>
}

export interface BatchResult {
  count: number
  message: string
}

export interface ApiResponse<T> {
  code: number
  message: string
  data: T
}

/**
 * 获取所有获奖者
 */
export function getWinners() {
  return defHttp.request< ApiResponse<Winner[]>>({
    url: '/winners',
    method: 'GET'
  })
}

/**
 * 分页获取获奖者
 */
export function getWinnersWithPagination(params: PaginationParams) {
  return defHttp.request<ApiResponse<PaginationResult<Winner>>>({
    url: '/winners/page',
    method: 'GET',
    params
  })
}

/**
 * 根据ID获取获奖者详情
 */
export function getWinnerById(id: number) {
  return defHttp.request<ApiResponse<Winner>>({
    url: `/winners/${id}`,
    method: 'GET'
  })
}

/**
 * 创建获奖者
 */
export function createWinner(data: CreateWinnerDto) {
  return defHttp.request<ApiResponse<Winner>>({
    url: '/winners',
    method: 'POST',
    data
  })
}

/**
 * 批量创建获奖者
 */
export function batchCreateWinners(data: CreateWinnerDto[]) {
  return defHttp.request<ApiResponse<BatchResult>>({
    url: '/winners/batch',
    method: 'POST',
    data
  })
}

/**
 * 更新获奖者信息
 */
export function updateWinner(id: number, data: UpdateWinnerDto) {
  return defHttp.request<ApiResponse<Winner>>({
    url: `/winners/${id}`,
    method: 'PUT',
    data
  })
}

/**
 * 删除获奖者
 */
export function deleteWinner(id: number) {
  return defHttp.request<ApiResponse<null>>({
    url: `/winners/${id}`,
    method: 'DELETE'
  })
}

/**
 * 批量删除获奖者
 */
export function batchDeleteWinners(ids: number[]) {
  return defHttp.request<ApiResponse<BatchResult>>({
    url: '/winners/batch',
    method: 'DELETE',
    data: { ids }
  })
}

/**
 * 按获奖等级筛选
 */
export function getWinnersByAward(award: string) {
  return defHttp.request<ApiResponse<Winner[]>>({
    url: '/winners/filter/award',
    method: 'GET',
    params: { award }
  })
}

/**
 * 按比赛名称筛选
 */
export function getWinnersByCompetition(competition: string) {
  return defHttp.request<ApiResponse<Winner[]>>({
    url: '/winners/filter/competition',
    method: 'GET',
    params: { competition }
  })
}

/**
 * 获取获奖者统计数据
 */
export function getWinnersStats() {
  return defHttp.request<ApiResponse<WinnerStats>>({
    url: '/winners/stats',
    method: 'GET'
  })
} 