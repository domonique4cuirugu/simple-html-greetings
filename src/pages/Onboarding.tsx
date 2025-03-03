
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const companySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters"),
  industry: z.string().optional(),
  contactEmail: z.string().email("Invalid email format").optional(),
  contactPhone: z.string().optional(),
  address: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

const Onboarding = () => {
  const { user, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      contactEmail: user?.email || "",
      contactPhone: "",
      address: "",
    },
  });

  useEffect(() => {
    // Check if user has already completed onboarding
    const checkOnboardingStatus = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from("profiles")
            .select("onboarding_completed, company_id")
            .eq("id", user.id)
            .single();

          if (error) throw error;

          if (data?.onboarding_completed) {
            setOnboardingCompleted(true);
            // Redirect to home if onboarding is already completed
            navigate("/");
          } else if (data?.company_id) {
            // If they have a company but onboarding is not complete, fetch company details
            const { data: companyData, error: companyError } = await supabase
              .from("companies")
              .select("*")
              .eq("id", data.company_id)
              .single();

            if (companyError) throw companyError;

            form.reset({
              name: companyData.name,
              industry: companyData.industry || "",
              contactEmail: companyData.contact_email || user.email || "",
              contactPhone: companyData.contact_phone || "",
              address: companyData.address || "",
            });
          }
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        }
      }
    };

    if (!authLoading) {
      checkOnboardingStatus();
    }
  }, [user, authLoading, navigate, form]);

  const onSubmit = async (values: CompanyFormValues) => {
    if (!user) return;

    setLoading(true);
    try {
      // First, create or update the company
      let companyId;
      
      // Check if user already has a company
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();
      
      if (profileError && profileError.code !== "PGRST116") { // PGRST116 is "row not found"
        throw profileError;
      }

      if (profileData?.company_id) {
        // Update existing company
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            name: values.name,
            industry: values.industry,
            contact_email: values.contactEmail,
            contact_phone: values.contactPhone,
            address: values.address,
          })
          .eq("id", profileData.company_id);

        if (updateError) throw updateError;
        companyId = profileData.company_id;
      } else {
        // Create new company
        const { data: newCompany, error: insertError } = await supabase
          .from("companies")
          .insert({
            name: values.name,
            industry: values.industry,
            contact_email: values.contactEmail,
            contact_phone: values.contactPhone,
            address: values.address,
          })
          .select("id")
          .single();

        if (insertError) throw insertError;
        companyId = newCompany.id;
      }

      // Update user profile with company_id and set onboarding_completed to true
      const { error: updateProfileError } = await supabase
        .from("profiles")
        .update({
          company_id: companyId,
          onboarding_completed: true,
          role: "Client", // Set role to Client upon completing onboarding
        })
        .eq("id", user.id);

      if (updateProfileError) throw updateProfileError;

      toast({
        title: "Onboarding complete!",
        description: "Your account has been fully set up.",
      });

      setOnboardingCompleted(true);
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Error during onboarding",
        description: error.message || "There was a problem completing your onboarding.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="container mx-auto px-4 flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate("/auth");
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Complete Your Account Setup</CardTitle>
            <CardDescription>
              Please provide your company information to complete the onboarding process
            </CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter company name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Industry</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Manufacturing, Retail, etc." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email</FormLabel>
                      <FormControl>
                        <Input placeholder="contact@example.com" type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contactPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+1 (555) 123-4567" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Business Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter your business address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Complete Setup"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Onboarding;
