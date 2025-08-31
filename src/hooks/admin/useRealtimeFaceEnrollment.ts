import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface FaceEnrollmentData {
  id: string;
  user_id: string;
  enrollment_date: string;
  enrolled_by: string | null;
  is_active: boolean;
  confidence_threshold: number;
  created_at: string;
  updated_at: string;
}

export interface FaceEnrollmentUser {
  id: string;
  email?: string;
  phone_number?: string;
  face_verified: boolean;
  created_at: string;
  role: string;
}

export function useRealtimeFaceEnrollment() {
  const [users, setUsers] = useState<FaceEnrollmentUser[]>([]);
  const [enrollments, setEnrollments] = useState<FaceEnrollmentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      // Fetch users
      const { data: usersData, error: usersError } = await supabase
        .from("users")
        .select("id, email, phone_number, face_verified, created_at, role")
        .order("created_at", { ascending: false });
      
      if (usersError) throw usersError;

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from("face_enrollment")
        .select("*")
        .order("enrollment_date", { ascending: false });
      
      if (enrollmentsError) throw enrollmentsError;

      setUsers(usersData || []);
      setEnrollments(enrollmentsData || []);
      setLoading(false);
    } catch (error) {
      console.error("[useRealtimeFaceEnrollment] Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    const channel = supabase
      .channel("realtime-face-enrollment")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        (payload) => {
          console.log("[useRealtimeFaceEnrollment] Users change", payload);
          fetchData();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "face_enrollment" },
        (payload) => {
          console.log("[useRealtimeFaceEnrollment] Face enrollment change", payload);
          fetchData();
        }
      )
      .subscribe();

    // Refresh every 5 seconds for enrollment updates
    const interval = setInterval(fetchData, 5000);

    return () => {
      supabase.removeChannel(channel);
      clearInterval(interval);
    };
  }, []);

  const enrolledUsers = useMemo(() => users.filter(user => user.face_verified), [users]);
  const unenrolledUsers = useMemo(() => users.filter(user => !user.face_verified), [users]);

  return useMemo(() => ({ 
    users, 
    enrollments, 
    enrolledUsers, 
    unenrolledUsers, 
    loading 
  }), [users, enrollments, enrolledUsers, unenrolledUsers, loading]);
}