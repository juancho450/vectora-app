import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { Transaction } from '../interfaces/transaction.interface';
import { TransactionsService } from '../services/transaction.service';


const transactionsAdapter = createEntityAdapter<Transaction>({
  selectId: (transaction) => transaction.id,
  sortComparer: (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
});

const initialState = transactionsAdapter.getInitialState({
  loaded: false,
  loading: false,
  error: null as string | null,
  selectedTransactionId: null as string | null,
  currentAccountId: null as string | null,
});

type TransactionsState = typeof initialState;

export const TransactionsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, currentAccountId, selectedTransactionId, loading, error }) => {
    return {
      transactions: computed(() => Object.values(entities()).filter(Boolean) as Transaction[]),
      filteredTransactions: computed(() => {
        const accountId = currentAccountId();
        if (!accountId) return Object.values(entities()).filter(Boolean) as Transaction[];
        return Object.values(entities())
          .filter(Boolean)
          .filter((t) => t && t.accountId === accountId) as Transaction[];
      }),
      selectedTransaction: computed(() => {
        const id = selectedTransactionId();
        return id ? entities()[id] || null : null;
      }),
      isLoading: computed(() => loading()),
      error: computed(() => error()),
    };
  }),
  withMethods((store) => {
    const transactionsService = inject(TransactionsService);
    
    return {
      loadTransactions: rxMethod<string | undefined>(
        pipe(
          tap((accountId: string | undefined) => {
            patchState(store, { 
              loading: true, 
              error: null,
              currentAccountId: accountId || null 
            });
          }),
          switchMap((accountId) => 
            transactionsService.getTransactions(accountId).pipe(
              map(transactions => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedTransactionId: store.selectedTransactionId(),
                  currentAccountId: store.currentAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as TransactionsState;
                
                const result = transactionsAdapter.setAll(transactions, state);
                
                patchState(store, {
                  entities: result.entities,
                  ids: result.ids,
                  loaded: true,
                  loading: false
                });
              }),
              catchError(error => {
                patchState(store, { 
                  error: error.message || 'Error al cargar las transacciones', 
                  loading: false 
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      selectTransaction: (id: string) => {
        patchState(store, { selectedTransactionId: id });
      },
      
      createTransaction: rxMethod<Omit<Transaction, 'id'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(newTransaction => 
            transactionsService.createTransaction(newTransaction).pipe(
              map(transaction => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedTransactionId: store.selectedTransactionId(),
                  currentAccountId: store.currentAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as TransactionsState;
                
                const result = transactionsAdapter.addOne(transaction, state);
                
                patchState(store, { 
                  entities: result.entities, 
                  ids: result.ids, 
                  loading: false 
                });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al crear la transacción',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      updateTransaction: rxMethod<Transaction>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(updatedTransaction => 
            transactionsService.updateTransaction(updatedTransaction).pipe(
              map(transaction => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedTransactionId: store.selectedTransactionId(),
                  currentAccountId: store.currentAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as TransactionsState;
                
                const result = transactionsAdapter.updateOne(
                  { id: transaction.id, changes: transaction },
                  state
                );
                
                patchState(store, { 
                  entities: result.entities, 
                  ids: result.ids, 
                  loading: false 
                });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al actualizar la transacción',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      filterByAccount: (accountId: string | null) => {
        patchState(store, { currentAccountId: accountId });
      }
    };
  })
);
