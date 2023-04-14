import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { TabnavPage } from './tabnav/tabnav.page';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'tabs/hymns',
    pathMatch: 'full',
  },
  {
    path: 'tabs',
    component: TabnavPage,
    children: [
      {
        path: 'hymns',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./pages/hymn-list/hymn-list.module').then(
                (m) => m.HymnListPageModule
              ),
          },
          {
            path: ':hymnNumber',
            loadChildren: () =>
              import('./pages/hymn-detail/hymn-detail.module').then(
                (m) => m.HymnDetailPageModule
              ),
          },
        ],
      },
      {
        path: 'favorites',
        children: [
          {
            path: '',
            loadChildren: () =>
              import('./pages/favorites/favorites.module').then(
                (m) => m.FavoritesPageModule
              ),
          },
          {
            path: ':id',
            loadChildren: () =>
              import('./pages/favorites-detail/favorites-detail.module').then(
                (m) => m.FavoritesDetailPageModule
              ),
          },
          {
            path: ':favouriteId/hymns/:hymnNumber',
            loadChildren: () =>
              import(
                './pages/favourite-hymn-detail/favourite-hymn-detail.module'
              ).then((m) => m.FavouriteHymnDetailPageModule),
          },
        ],
      },
      {
        path: 'info',
        loadChildren: () =>
          import('./pages/info/info.module').then((m) => m.InfoPageModule),
      },
    ],
  },
  {
    path: 'hymn-list',
    loadChildren: () =>
      import('./pages/hymn-list/hymn-list.module').then(
        (m) => m.HymnListPageModule
      ),
  },
  {
    path: 'hymn-detail',
    loadChildren: () =>
      import('./pages/hymn-detail/hymn-detail.module').then(
        (m) => m.HymnDetailPageModule
      ),
  },
  {
    path: 'favorites-detail',
    loadChildren: () =>
      import('./pages/favorites-detail/favorites-detail.module').then(
        (m) => m.FavoritesDetailPageModule
      ),
  },
  {
    path: 'favourite-modal',
    loadChildren: () =>
      import('./pages/favourite-modal/favourite-modal.module').then(
        (m) => m.FavouriteModalPageModule
      ),
  },
  {
    path: 'feedback-modal',
    loadChildren: () =>
      import('./pages/feedback-modal/feedback-modal.module').then(
        (m) => m.FeedbackModalPageModule
      ),
  },
  {
    path: 'favourite-hymn-detail',
    loadChildren: () =>
      import('./pages/favourite-hymn-detail/favourite-hymn-detail.module').then(
        (m) => m.FavouriteHymnDetailPageModule
      ),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
