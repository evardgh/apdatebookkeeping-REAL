

import React, { useState, useEffect } from 'react';
import { AppData, Transaction, View, Business, Category, TransactionType, Client, Vendor, Item, PartialTransaction, Quotation, QuotationItem } from './types';
import BottomNav from './components/BottomNav';
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import AIAssistantView from './components/AIAssistantView';
import AddTransactionModal from './components/AddTransactionModal';
import Header from './components/Header';
import SplashScreen from './components/SplashScreen';
import ProfileView from './components/ProfileView';
import SettingsView from './SettingsView';
import MoreView from './components/MoreView';
import InsightsView from './components/InsightsView';
import PinLockScreen from './components/PinLockScreen';
import AIHelpModal from './components/AIHelpModal';
import VoiceInputModal from './components/VoiceInputModal';
import AddOptionsOverlay from './components/AddOptionsOverlay';
import OnboardingWizard from './components/OnboardingWizard';
import InvoicesAndQuotesView from './components/DocumentsView';
import PreviewModal from './components/PreviewModal';
import CreateDocumentModal from './components/CreateDocumentModal';
import ConfirmationModal from './components/ConfirmationModal';
import DocumentVoiceInputModal from './components/DocumentVoiceInputModal';
import BusinessesView from './components/BusinessesView';
import OrdersView from './components/OrdersView';
import { useAppContext } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import AuthView from './components/AuthView';


const AppContent: React.FC = () => {
    const { 
      appData, 
      activeBusiness, 
      dataForActiveBusiness,
      usedClientIds,
      usedVendorIds,
      addTransaction, 
      updateTransaction, 
      deleteTransaction,
      addPayment,
      addQuotation,
      updateQuotation,
      deleteQuotation,
      convertQuoteToInvoice,
      createInvoiceFromScratch,
      addCategory,
      addItem,
      addClient,
      updateClient,
      deleteClient,
      addVendor,
      updateVendor,
      deleteVendor,
      addBusiness,
      updateBusiness,
      confirmationState,
      closeConfirmation
    } = useAppContext();

    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [helpTopic, setHelpTopic] = useState<string | null>(null);

    const [isAddOptionsOpen, setIsAddOptionsOpen] = useState(false);
    const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
    const [prefilledTransaction, setPrefilledTransaction] = useState<PartialTransaction | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Transaction | null>(null);
    const [startAsOrder, setStartAsOrder] = useState(false);

    const [documentToPreview, setDocumentToPreview] = useState<{ doc: Transaction | Quotation, mode: 'invoice' | 'quotation' } | null>(null);
    const [documentToCreate, setDocumentToCreate] = useState<{ doc?: Quotation, mode: 'invoice' | 'quotation', initialData?: {clientId: string, items: QuotationItem[]} } | null>(null);
    
    const [isDocVoiceModalOpen, setIsDocVoiceModalOpen] = useState(false);
    const [docVoiceMode, setDocVoiceMode] = useState<'invoice' | 'quotation'>('invoice');
    
    const handleVoiceParseComplete = async (data: PartialTransaction) => {
        setIsVoiceModalOpen(false);

        let finalData = { ...data };
        let finalClientId = data.clientId;
        let finalVendorId = data.vendorId;

        if (data.name) {
            const itemExists = appData.items.find(i => i.name.toLowerCase() === data.name?.toLowerCase() && i.type === data.type);
            if (!itemExists) {
                await addItem({
                    name: data.name,
                    type: data.type || TransactionType.EXPENSE,
                    nature: data.nature || 'service',
                    unitPrice: data.unitPrice
                });
            }
        }

        if (data.newClientName) {
            const existingClient = appData.clients.find(c => c.name.toLowerCase() === data.newClientName?.toLowerCase());
            if (existingClient) {
                finalClientId = existingClient.id;
            } else {
                const newClient = await addClient({ name: data.newClientName });
                finalClientId = newClient.id;
            }
        }

        if (data.newVendorName) {
            const existingVendor = appData.vendors.find(v => v.name.toLowerCase() === data.newVendorName?.toLowerCase());
            if (existingVendor) {
                finalVendorId = existingVendor.id;
            } else {
                const newVendor = await addVendor({ name: data.newVendorName });
                finalVendorId = newVendor.id;
            }
        }
        
        finalData.clientId = finalClientId;
        finalData.vendorId = finalVendorId;
        
        if (finalData.orderStatus) {
            setStartAsOrder(true);
        }

        setPrefilledTransaction(finalData);
        setIsModalOpen(true);
    };
    
    const handleDocVoiceParseComplete = async (data: { clientName?: string, items?: QuotationItem[] }) => {
        setIsDocVoiceModalOpen(false);
        let finalClientId = '';
        
        if (data.clientName) {
            const existingClient = appData.clients.find(c => c.name.toLowerCase() === data.clientName?.toLowerCase());
            if(existingClient) {
                finalClientId = existingClient.id;
            } else {
                const newClient = await addClient({ name: data.clientName });
                finalClientId = newClient.id;
            }
        }
        
        setDocumentToCreate({
            mode: docVoiceMode,
            initialData: {
                clientId: finalClientId,
                items: data.items || [],
            }
        });
    };

    const handleCloseAddTransactionModal = () => {
        setIsModalOpen(false);
        setPrefilledTransaction(null);
        setTransactionToEdit(null);
        setStartAsOrder(false);
    }
    
    const handleEditTransaction = (transaction: Transaction) => {
        setTransactionToEdit(transaction);
        setIsModalOpen(true);
    };
    
    const handleConvertQuoteToInvoice = (quote: Quotation) => {
        convertQuoteToInvoice(quote);
        setDocumentToPreview(null);
    };

    const renderView = () => {
        if (!activeBusiness) {
            return <BusinessesView />;
        }

        switch(currentView) {
            case 'dashboard':
                return <Dashboard setCurrentView={setCurrentView} />;
            case 'transactions':
                return <TransactionsView onEditTransaction={handleEditTransaction} onAddTransactionClick={() => setIsAddOptionsOpen(true)} />;
            case 'ai':
                return <AIAssistantView />;
            case 'more':
                return <MoreView setCurrentView={setCurrentView} />;
            case 'profile':
                 return <ProfileView />;
            case 'businesses':
                return <BusinessesView />;
            case 'settings':
                return <SettingsView />;
            case 'insights':
                return <InsightsView />;
            case 'documents':
                 return <InvoicesAndQuotesView 
                    onPreviewInvoice={(invoice) => setDocumentToPreview({ doc: invoice, mode: 'invoice' })}
                    onPreviewQuote={(quote) => setDocumentToPreview({ doc: quote, mode: 'quotation' })}
                    onCreateInvoice={() => setDocumentToCreate({ mode: 'invoice' })}
                    onCreateQuote={() => setDocumentToCreate({ mode: 'quotation' })}
                    onVoiceInvoiceClick={() => {
                        setDocVoiceMode('invoice');
                        setIsDocVoiceModalOpen(true);
                    }}
                    onVoiceQuoteClick={() => {
                        setDocVoiceMode('quotation');
                        setIsDocVoiceModalOpen(true);
                    }}
                />;
            case 'orders':
                return <OrdersView 
                    onEditOrder={handleEditTransaction}
                    onAddOrder={() => {
                        setStartAsOrder(true);
                        setIsModalOpen(true);
                    }}
                    onAddOrderByVoice={() => setIsVoiceModalOpen(true)}
                />
            default:
                return <Dashboard setCurrentView={setCurrentView} />;
        }
    };
    
    const subViews: View[] = ['profile', 'settings', 'insights', 'documents', 'businesses', 'orders'];
    const handleBack = subViews.includes(currentView)
        ? () => setCurrentView('more')
        : undefined;

    const handleHelpClick = (topic: string) => {
        setHelpTopic(topic);
    };

    const viewsWithHelp: View[] = ['transactions'];

    return (
        <div className="bg-light-bg-default dark:bg-dark-bg-default font-sans text-light-fg-default dark:text-dark-fg-default">
            <div className="max-w-md mx-auto min-h-screen shadow-2xl bg-light-bg-subtle dark:bg-dark-bg-default flex flex-col">
                <Header 
                    view={currentView}
                    onBack={handleBack}
                    onHelpClick={viewsWithHelp.includes(currentView) ? () => handleHelpClick(currentView) : undefined}
                />
                
                <main className="flex-grow p-4 overflow-y-auto pb-24">
                    {renderView()}
                </main>

                <BottomNav 
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    onAddClick={() => setIsAddOptionsOpen(true)}
                />

                {isAddOptionsOpen && (
                    <AddOptionsOverlay 
                        onClose={() => setIsAddOptionsOpen(false)}
                        onManualClick={() => {
                            setIsAddOptionsOpen(false);
                            setIsModalOpen(true);
                        }}
                        onVoiceClick={() => {
                            setIsAddOptionsOpen(false);
                            setIsVoiceModalOpen(true);
                        }}
                    />
                )}

                {isVoiceModalOpen && (
                    <VoiceInputModal 
                        onClose={() => setIsVoiceModalOpen(false)}
                        onParseComplete={handleVoiceParseComplete}
                    />
                )}
                
                 {isDocVoiceModalOpen && (
                    <DocumentVoiceInputModal 
                        onClose={() => setIsDocVoiceModalOpen(false)}
                        onParseComplete={handleDocVoiceParseComplete}
                        mode={docVoiceMode}
                    />
                )}

                {isModalOpen && (
                    <AddTransactionModal 
                        onClose={handleCloseAddTransactionModal}
                        initialData={prefilledTransaction}
                        transactionToEdit={transactionToEdit}
                        startAsOrder={startAsOrder}
                    />
                )}

                {helpTopic && (
                    <AIHelpModal
                        topic={helpTopic}
                        onClose={() => setHelpTopic(null)}
                    />
                )}
                
                {documentToPreview && activeBusiness && (
                    <PreviewModal
                        document={documentToPreview.doc}
                        mode={documentToPreview.mode}
                        business={activeBusiness}
                        client={dataForActiveBusiness.clients.find(c => c.id === documentToPreview.doc.clientId)}
                        quote={'relatedQuotationId' in documentToPreview.doc ? dataForActiveBusiness.quotations.find(q => q.id === (documentToPreview.doc as Transaction).relatedQuotationId) : undefined}
                        onClose={() => setDocumentToPreview(null)}
                        onEdit={(quote) => {
                            setDocumentToPreview(null);
                            setDocumentToCreate({ doc: quote, mode: 'quotation' });
                        }}
                        onDelete={deleteQuotation}
                        onConvert={handleConvertQuoteToInvoice}
                        addPayment={addPayment}
                    />
                )}

                {documentToCreate && activeBusiness && (
                    <CreateDocumentModal
                        mode={documentToCreate.mode}
                        quoteToEdit={documentToCreate.mode === 'quotation' ? (documentToCreate.doc) : undefined}
                        initialData={documentToCreate.initialData}
                        onClose={() => setDocumentToCreate(null)}
                        onSaveQuote={(q) => {
                            if(q.id) { updateQuotation(q); } else { addQuotation(q); }
                        }}
                        onSaveInvoice={createInvoiceFromScratch}
                    />
                )}
                
                <ConfirmationModal
                    isOpen={confirmationState.isOpen}
                    onClose={closeConfirmation}
                    onConfirm={confirmationState.onConfirm}
                    title={confirmationState.title}
                    message={confirmationState.message}
                />
            </div>
        </div>
    );
};


const App: React.FC = () => {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <SplashScreen />;
    }

    if (!user) {
        return <AuthView />;
    }

    return <AppInitializer />;
};

const AppInitializer: React.FC = () => {
    const { appData, onOnboardingComplete, isDataLoading } = useAppContext();
    const [isLocked, setIsLocked] = useState<boolean>(appData.settings.isPinEnabled);

    useEffect(() => {
        const html = document.documentElement;
        if (appData.settings.theme === 'dark') {
            html.classList.add('dark');
        } else {
            html.classList.remove('dark');
        }
        // Also persist theme choice for initial load flash prevention
        localStorage.setItem('app-theme', appData.settings.theme);
    }, [appData.settings.theme]);

    if (isDataLoading) {
        return <SplashScreen />;
    }
    
    // Onboarding is triggered if a user has no businesses.
    if (appData.businesses.length === 0) {
        return <OnboardingWizard onComplete={onOnboardingComplete} />;
    }
    
    if (isLocked) {
        return <PinLockScreen onUnlock={() => setIsLocked(false)} />;
    }
    
    return <AppContent />;
}

export default App;