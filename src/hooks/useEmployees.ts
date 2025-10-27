import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import type { Employee } from '../types'

interface UseEmployeesReturn {
  employees: Employee[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useEmployees(): UseEmployeesReturn {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEmployees = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('employees')
        .select('*')
        .eq('is_active', true)
        .order('name')

      if (fetchError) {
        throw new Error(fetchError.message)
      }

      setEmployees(data || [])
      console.log(`✅ 社員データ取得成功: ${data?.length || 0}件`)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '社員データの取得に失敗しました'
      setError(errorMessage)
      console.error('❌ 社員データ取得エラー:', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEmployees()
  }, [fetchEmployees])

  return {
    employees,
    loading,
    error,
    refetch: fetchEmployees
  }
}