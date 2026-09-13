import { createApi } from '@reduxjs/toolkit/query/react'
import {
  GetAllExpenseAPI,
  CreateExpenseAPI,
  UpdateExpenseAPI,
  DeleteExpenseAPI,
} from '../API/expenseApi'
// Normally, RTK Query uses fetchBaseQuery to make HTTP requests.
// We can't use it here because our mock backend intercepts Axios
// requests, not fetch requests. So we use a custom baseQuery that
// calls our existing Axios API functions (apiFn) with the given
// parameters (params), then converts the result into the format
// RTK Query expects: { data } on success or { error } on failure.

function axiosBaseQuery() {
  return async ({ apiFn, params }) => {
    try {
      const response = await apiFn(params)
      return { data: response.data }
    } catch (error) {
      return { error: { status: error.response?.status, message: error.message } }
    }
  }
}

export const expenseApiSlice = createApi({ //This creates an RTK Query API slice called expenseApiSlice.
  reducerPath: 'expenseApi', // the key this slice's state lives under in the store
  baseQuery: axiosBaseQuery(), //normally this would be: baseQuery: fetchBaseQuery(...)
  tagTypes: ['Expense'], 
  endpoints: (builder) => ({ //Under this we define our endpoints.

    getExpenses: builder.query({ //This tells RTK Query: "getExpenses is an operation for getting data."
      query: ({ page, filterBy, sortBy, searchBy }) => ({ //This function aka(useGetExpensesQuery) receives these arguments from the component.
        apiFn: GetAllExpenseAPI,
        params: { page, filterBy, sortBy, searchBy },
      }),
          // "The data this query returns is tagged as THE list." Any mutation
      // that invalidates this same tag will make RTK Query refetch this
      // query automatically, for every component currently subscribed to it.
      providesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
    
     addExpense: builder.mutation({
      query: (newExpense) => ({ apiFn: CreateExpenseAPI, params: newExpense }),
      // "Once this succeeds, the LIST tag is stale." RTK Query then
      // automatically refetches getExpenses for any active subscriber —
      // no getState(), no manual re-dispatch, unlike Step 4's hand-rolled version.
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),

    updateExpense: builder.mutation({
      query: (updatedExpense) => ({ apiFn: UpdateExpenseAPI, params: updatedExpense }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),

    deleteExpense: builder.mutation({
      query: (id) => ({ apiFn: DeleteExpenseAPI, params: id }),
      invalidatesTags: [{ type: 'Expense', id: 'LIST' }],
    }),
  }),
})

// Auto-generated — one hook per endpoint, named use<EndpointName>Query/Mutation.
export const {
  useGetExpensesQuery,
  useAddExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,
} = expenseApiSlice
