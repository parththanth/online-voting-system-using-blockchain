
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ConfirmationTicket from "@/components/ConfirmationTicket";

const Confirmation = () => {
  const [voteData, setVoteData] = useState<any>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get vote data from localStorage
    const storedVoteData = localStorage.getItem('voteData');
    
    if (!storedVoteData) {
      // If no vote data, redirect to home
      navigate('/');
      return;
    }
    
    try {
      const data = JSON.parse(storedVoteData);
      setVoteData(data);
      
      // Clear the vote data from localStorage after using it
      localStorage.removeItem('voteData');
    } catch (error) {
      console.error('Error parsing vote data:', error);
      navigate('/');
    }
  }, [navigate]);

  // Party mapping for display
  const parties: Record<string, { name: string; logoPath: string }> = {
    "PTY-001": { 
      name: "Bharatiya Janata Party", 
      logoPath: "/lovable-uploads/bd528e11-c547-4096-be22-973ccf0a7e69.png" 
    },
    "PTY-002": { 
      name: "Indian National Congress", 
      logoPath: "/lovable-uploads/6d40bf13-e73a-4e1b-82fe-7c36e7663ad3.png" 
    },
    "PTY-003": { 
      name: "Aam Aadmi Party", 
      logoPath: "/lovable-uploads/c1e1f869-b9f5-4251-9872-e4504191624a.png" 
    },
    "PTY-004": { 
      name: "None of the Above", 
      logoPath: "/lovable-uploads/893342f4-7eb9-4b71-9b23-dbd4445bf9a0.png" 
    }
  };

  if (!voteData) {
    return <div>Loading...</div>;
  }

  const selectedParty = parties[voteData.partyId];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 bg-gradient-to-b from-background to-secondary/30">
        <div className="container mx-auto px-4 py-20 pt-32">
          <ConfirmationTicket 
            transactionId={voteData.transactionId}
            timestamp={voteData.timestamp}
            partyName={selectedParty?.name || 'Unknown Party'}
            partyLogo={selectedParty?.logoPath || ''}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Confirmation;
