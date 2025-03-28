import { EntityState, createEntityAdapter } from '@ngrx/entity';
import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { BankAccount } from '../interfaces/account.interface';
import { AccountsService } from '../services/account.service';

const accountsAdapter = createEntityAdapter<BankAccount>({
  selectId: (account: BankAccount) => account.id,
});

const initialState = accountsAdapter.getInitialState({
  loaded: false,
  loading: false,
  error: null as string | null,
  selectedAccountId: null as string | null,
});

type AccountsState = typeof initialState;

export const AccountsStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed(({ entities, selectedAccountId, loading, error }) => {
    return {
      accounts: computed(() => Object.values(entities()).filter(Boolean) as BankAccount[]),
      totalBalance: computed(() => 
        Object.values(entities())
          .filter((account): account is BankAccount => Boolean(account))
          .reduce((sum: number, account: BankAccount) => sum + account.balance, 0)
      ),
      selectedAccount: computed(() => {
        const id = selectedAccountId();
        return id ? entities()[id] || null : null;
      }),
      isLoading: computed(() => loading()),
      error: computed(() => error()),
    };
  }),
  withMethods((store) => {
    const accountsService = inject(AccountsService);
    
    return {
      loadAccounts: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(() => 
            accountsService.getAccounts().pipe(
              map(accounts => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.setAll(accounts, state);
                
                patchState(store, {
                  entities: result.entities,
                  ids: result.ids,
                  loaded: true,
                  loading: false,
                });
              }),
              catchError(error => {
                patchState(store, { 
                  error: error.message || 'Error al cargar las cuentas', 
                  loading: false 
                });
                return of(null);
              })
            )
          )
        )
      ),

         loadAccountById: rxMethod<string>(
          pipe(
            tap(() => patchState(store, { loading: true, error: null })),
            switchMap((id: string) => 
              accountsService.getAccountById(id).pipe(
                map(accounts => {
                  const state = {
                    ids: store.ids(),
                    entities: store.entities(),
                    selectedAccountId: store.selectedAccountId(),
                    loaded: store.loaded(),
                    loading: store.loading(),
                    error: store.error()
                  } as AccountsState;
                  
                  const result = accountsAdapter.addOne(accounts, state);
                  
                  patchState(store, {
                    entities: result.entities,
                    ids: result.ids,
                    loaded: true,
                    loading: false,
                  });
                }),
                catchError(error => {
                  patchState(store, { 
                    error: error.message || 'Error al cargar las cuentas', 
                    loading: false 
                  });
                  return of(null);
                })
              )
            )
          )
        ),
      
      selectAccount: (id: string) => {
        patchState(store, { selectedAccountId: id });
      },
      
      createAccount: rxMethod<Omit<BankAccount, 'id'>>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(newAccount => 
            accountsService.createAccount(newAccount).pipe(
              map(account => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.addOne(account, state);
                
                patchState(store, { entities: result.entities, ids: result.ids, loading: false });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al crear la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      updateAccount: rxMethod<BankAccount>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(updatedAccount => 
            accountsService.updateAccount(updatedAccount).pipe(
              map(account => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.updateOne(
                  { id: account.id, changes: account },
                  state
                );
                
                patchState(store, { entities: result.entities, ids: result.ids, loading: false });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al actualizar la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      ),
      
      deleteAccount: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { loading: true, error: null })),
          switchMap(id => 
            accountsService.deleteAccount(id).pipe(
              map(() => {
                const state = {
                  ids: store.ids(),
                  entities: store.entities(),
                  selectedAccountId: store.selectedAccountId(),
                  loaded: store.loaded(),
                  loading: store.loading(),
                  error: store.error()
                } as AccountsState;
                
                const result = accountsAdapter.removeOne(id, state);
                
                patchState(store, { 
                  entities: result.entities, 
                  ids: result.ids, 
                  loading: false,
                  selectedAccountId: store.selectedAccountId() === id ? null : store.selectedAccountId()
                });
              }),
              catchError(error => {
                patchState(store, {
                  error: error.message || 'Error al eliminar la cuenta',
                  loading: false
                });
                return of(null);
              })
            )
          )
        )
      )
    };
  })
);
