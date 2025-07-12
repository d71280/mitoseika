
import React, { useState } from 'react';
import DashboardPage from './components/DashboardPage';
import DetailedAnalysisPage from './components/DetailedAnalysisPage';
import SupplierListPage from './components/SupplierListPage';
import SettingsPage from './components/SettingsPage';
import Sidebar from './components/layout/Sidebar';
import ProductAnalysisDetailPage from './components/analysis/ProductAnalysisDetailPage';
import ClientAnalysisDetailPage from './components/analysis/ClientAnalysisDetailPage';
import DeliverySlipPage from './components/DeliverySlipPage';
import InventoryManagementPage from './components/InventoryManagementPage';
import ClientManagementPage from './components/ClientManagementPage';
import ClientEditPage from './components/ClientEditPage';
import InventoryTakingPage from './components/inventory/InventoryTakingPage'; // New
import InventoryAdjustPage from './components/inventory/InventoryAdjustPage'; // New
import OrderAnalysisPage from './components/OrderAnalysisPage';
import PurchasePriceInfoPage from './components/PurchasePriceInfoPage';
import { mockOrders, mitoSeikaCompanyInfo, Client, mockClients, Product, mockProductsInventory } from './types';

export enum PageView {
  DASHBOARD = 'dashboard',
  DETAILED_ANALYSIS = 'detailed_analysis',
  ORDER_ANALYSIS = 'order_analysis',
  PURCHASE_PRICE_INFO = 'purchase_price_info',
  SUPPLIER_LIST = 'supplier_list',
  SETTINGS = 'settings',
  PRODUCT_ANALYSIS_DETAIL = 'product_analysis_detail',
  CLIENT_ANALYSIS_DETAIL = 'client_analysis_detail',
  DELIVERY_SLIP = 'delivery_slip',
  INVENTORY_MANAGEMENT = 'inventory_management',
  CLIENT_MANAGEMENT = 'client_management',
  CLIENT_EDIT_PAGE = 'client_edit_page',
  INVENTORY_TAKING_PAGE = 'inventory_taking_page', // New
  INVENTORY_ADJUST_PAGE = 'inventory_adjust_page', // New
}

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageView>(PageView.DASHBOARD);
  const [selectedAnalysisItemId, setSelectedAnalysisItemId] = useState<string | null>(null);
  const [editingClientId, setEditingClientId] = useState<string | 'new' | null>(null);
  const [editingProductId, setEditingProductId] = useState<string | null>(null); // For inventory adjust

  // Lifted states
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [products, setProducts] = useState<Product[]>(mockProductsInventory); // Inventory products

  const navigateTo = (page: PageView, itemId?: string | 'new') => {
    setCurrentPage(page);
    setSelectedAnalysisItemId(null); // Reset analysis item
    setEditingClientId(null);      // Reset client edit item
    setEditingProductId(null);     // Reset product edit item

    if (page === PageView.PRODUCT_ANALYSIS_DETAIL || page === PageView.CLIENT_ANALYSIS_DETAIL) {
      setSelectedAnalysisItemId(itemId as string);
    } else if (page === PageView.CLIENT_EDIT_PAGE) {
      setEditingClientId(itemId as string | 'new');
    } else if (page === PageView.INVENTORY_ADJUST_PAGE) {
      setEditingProductId(itemId as string);
    }
  };

  const handleSaveClient = (clientData: Client) => {
    setClients(prevClients => {
      const existingClientIndex = prevClients.findIndex(c => c.id === clientData.id);
      if (existingClientIndex > -1) {
        const updatedClients = [...prevClients];
        updatedClients[existingClientIndex] = clientData;
        return updatedClients;
      } else {
        return [clientData, ...prevClients];
      }
    });
    navigateTo(PageView.CLIENT_MANAGEMENT);
  };

  const handleDeleteClient = (clientId: string) => {
    if (window.confirm(`顧客 ID: ${clientId} を本当に削除しますか？`)) {
        setClients(prevClients => prevClients.filter(c => c.id !== clientId));
    }
  };

  const handleSaveInventoryTaking = (updatedInventory: Product[]) => {
    setProducts(updatedInventory);
    navigateTo(PageView.INVENTORY_MANAGEMENT);
  };

  const handleSaveStockAdjustment = (productId: string, newStock: number) => {
    setProducts(prevProducts => 
      prevProducts.map(p => 
        p.id === productId ? { ...p, currentStock: newStock } : p
      )
    );
    navigateTo(PageView.INVENTORY_MANAGEMENT);
  };

  let pageContent;
  switch (currentPage) {
    case PageView.DETAILED_ANALYSIS:
      pageContent = <DetailedAnalysisPage navigateTo={navigateTo} />;
      break;
    case PageView.ORDER_ANALYSIS:
      pageContent = <OrderAnalysisPage orders={mockOrders} />;
      break;
    case PageView.PURCHASE_PRICE_INFO:
      pageContent = <PurchasePriceInfoPage />;
      break;
    case PageView.SUPPLIER_LIST:
      pageContent = <SupplierListPage />;
      break;
    case PageView.SETTINGS:
      pageContent = <SettingsPage navigateTo={navigateTo} />;
      break;
    case PageView.PRODUCT_ANALYSIS_DETAIL:
      if (selectedAnalysisItemId) {
        pageContent = (
          <ProductAnalysisDetailPage
            productId={selectedAnalysisItemId}
            onNavigateBack={() => navigateTo(PageView.DETAILED_ANALYSIS)}
          />
        );
      } else {
        pageContent = <DetailedAnalysisPage navigateTo={navigateTo} />; 
      }
      break;
    case PageView.CLIENT_ANALYSIS_DETAIL:
      if (selectedAnalysisItemId) {
        pageContent = (
          <ClientAnalysisDetailPage
            clientId={selectedAnalysisItemId}
            onNavigateBack={() => navigateTo(PageView.DETAILED_ANALYSIS)}
          />
        );
      } else {
        pageContent = <DetailedAnalysisPage navigateTo={navigateTo} />; 
      }
      break;
    case PageView.DELIVERY_SLIP:
      pageContent = <DeliverySlipPage orders={mockOrders} companyInfo={mitoSeikaCompanyInfo} />;
      break;
    case PageView.INVENTORY_MANAGEMENT: 
      pageContent = <InventoryManagementPage products={products} navigateTo={navigateTo} />;
      break;
    case PageView.CLIENT_MANAGEMENT: 
      pageContent = <ClientManagementPage clients={clients} navigateTo={navigateTo} onDeleteClient={handleDeleteClient} />;
      break;
    case PageView.CLIENT_EDIT_PAGE:
      if (editingClientId) {
        pageContent = (
          <ClientEditPage
            clientId={editingClientId}
            existingClients={clients}
            onSaveClient={handleSaveClient}
            onCancel={() => navigateTo(PageView.CLIENT_MANAGEMENT)}
          />
        );
      } else {
        pageContent = <ClientManagementPage clients={clients} navigateTo={navigateTo} onDeleteClient={handleDeleteClient} />;
      }
      break;
    case PageView.INVENTORY_TAKING_PAGE:
      pageContent = (
        <InventoryTakingPage 
          initialProducts={products} 
          onSaveAllCounts={handleSaveInventoryTaking}
          onCancel={() => navigateTo(PageView.INVENTORY_MANAGEMENT)}
        />
      );
      break;
    case PageView.INVENTORY_ADJUST_PAGE:
      if (editingProductId) {
        pageContent = (
          <InventoryAdjustPage
            productId={editingProductId}
            initialProducts={products}
            onSaveAdjustment={handleSaveStockAdjustment}
            onCancel={() => navigateTo(PageView.INVENTORY_MANAGEMENT)}
          />
        );
      } else {
         pageContent = <InventoryManagementPage products={products} navigateTo={navigateTo} />;
      }
      break;
    default: // PageView.DASHBOARD
      pageContent = <DashboardPage />;
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-green-700 via-lime-600 to-yellow-500">
      <Sidebar currentPage={currentPage} navigateTo={navigateTo} />
      <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto bg-slate-100 print:p-0 print:overflow-visible">
        <div className="w-full max-w-full mx-auto">
          {pageContent}
        </div>
      </main>
    </div>
  );
};

export default App;
