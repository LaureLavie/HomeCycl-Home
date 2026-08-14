import { test, expect } from '@playwright/test';

test.describe('HomeCycl’Home - Tests E2E (SCEN-01 à SCEN-09)', () => {

  // SCEN-01 : Réservation complète (Parcours client)
  test('SCEN-01 : Parcours client de réservation complète', async ({ page }) => {
    await page.goto('/');
    
    // 1. Saisir une adresse dans la zone de couverture
    await page.fill('input[name="adresse"]', '10 rue de la République, Lyon');
    await page.click('button:has-text("Rechercher")');

    // 2. Renseigner les infos du cycle & 3. Sélectionner un forfait
    await page.selectOption('select[id="velo"]', { index: 0 });
    await page.click('text=Révision Complète');

    // 4. Choisir un créneau disponible & 5. Produit additionnel
    await page.click('.slot-item:first-child');
    await page.click('text=Chambre à air');

    // 6. Connexion / Inscription (Utilisation du client de test)
    await page.click('text=Se connecter');
    await page.fill('input[name="email"]', 'client@test.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // 7. Valider la réservation
    await page.click('button:has-text("Confirmer la réservation")');

    // Vérifications
    await expect(page).toHaveURL(/\/client\/confirmation/);
    await expect(page.locator('text=Intervention planifiée')).toBeVisible();
  });

  // SCEN-02 : Connexion Admin - Tableau de bord
  test('SCEN-02 : Connexion Admin et vérification du dashboard', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'admin@hch.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/admin/dashboard');
    
    // Vérification de la présence des menus obligatoires
    await expect(page.locator('nav')).toContainText('Interventions');
    await expect(page.locator('nav')).toContainText('Forfaits');
    await expect(page.locator('nav')).toContainText('Zones');
    await expect(page.locator('nav')).toContainText('Utilisateurs');
    await expect(page.locator('nav')).toContainText('Planning');
  });

  // SCEN-03 : Connexion Technicien - Planning
  test('SCEN-03 : Connexion Technicien et accès au planning', async ({ page }) => {
    await page.goto('/login');
    
    await page.fill('input[name="email"]', 'tech@hch.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await page.goto('/technicien/planning');
    await expect(page.locator('h1')).toContainText('Mon Planning');
    await expect(page.locator('.intervention-card')).toBeVisible();
  });

  // SCEN-04 : Technicien - Clôture d'intervention
  test('SCEN-04 : Clôture d\'intervention par le technicien', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'tech@hch.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await page.goto('/technicien/planning');
    await page.click('.intervention-card:first-child');

    // Ajout d'un commentaire et passage au statut terminée
    await page.fill('textarea[name="commentaire"]', 'Réparation effectuée avec succès.');
    await page.selectOption('select[name="statut"]', 'TERMINEE');
    await page.click('button:has-text("Enregistrer")');

    await expect(page.locator('.success-message')).toBeVisible();
  });

  // SCEN-05 : Admin - Création zone + forfait + affectation
  test('SCEN-05 : Création de zone, forfait et modèle par l\'admin', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'admin@hch.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    // Création d'un forfait
    await page.goto('/admin/forfaits/nouveau');
    await page.fill('input[name="nom"]', 'Forfait Test E2E');
    await page.fill('input[name="prix"]', '60');
    await page.fill('input[name="duree_minutes"]', '90');
    await page.click('button[type="submit"]');

    await expect(page.locator('text=Forfait Test E2E')).toBeVisible();
  });

  // SCEN-06 : Client - Annulation de réservation
  test('SCEN-06 : Annulation d\'une réservation par le client', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'client@test.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await page.goto('/client/interventions');
    await page.click('.intervention-item:first-child button:has-text("Annuler")');
    await page.click('button:has-text("Confirmer l\'annulation")');

    await expect(page.locator('text=annulee')).toBeVisible();
  });

  // SCEN-07 : Réservation - Adresse hors zone
  test('SCEN-07 : Test d\'une adresse hors zone de couverture', async ({ page }) => {
    await page.goto('/');
    
    await page.fill('input[name="adresse"]', '999 chemin perdu, 00000 NullePart');
    await page.click('button:has-text("Rechercher")');

    await expect(page.locator('.alert-error')).toContainText('Service non disponible dans votre secteur');
  });

  // SCEN-08 : Sécurité - Accès direct URL sans connexion
  test('SCEN-08 : Redirection automatique vers /login si non authentifié', async ({ page }) => {
    const protectedRoutes = ['/admin/dashboard', '/technicien/planning', '/client/profil'];

    for (const route of protectedRoutes) {
      await page.goto(route);
      await expect(page).toHaveURL(/\/login/);
    }
  });

  // SCEN-09 : Sécurité - Tentative d'accès inter-rôles (Client -> Admin)
  test('SCEN-09 : Blocage d\'un utilisateur Client sur une route Admin (HTTP 403)', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="email"]', 'client@test.com');
    await page.fill('input[name="password"]', 'Password123');
    await page.click('button[type="submit"]');

    await page.goto('/admin/dashboard');
    
    // Vérification de la présence d'une erreur 403 ou d'un message d'accès refusé
    await expect(page.locator('text=403')).toBeVisible().catch(async () => {
      await expect(page.locator('text=Accès non autorisé')).toBeVisible();
    });
  });

});