"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import InputField from "@/components/forms/fields/InputField";
import SelectField from "@/components/forms/fields/SelectField";
import TextareaField from "@/components/forms/fields/TextareaField";
import Button from "@/components/common/Button";

import { contactSchema, ContactFormValues } from "@/schemas/contact.schema";
import { notify } from "@/lib/notify";

const serviceOptions = [
  {
    label: "Company Registration",
    value: "company-registration",
  },
  {
    label: "GST Registration",
    value: "gst",
  },
  {
    label: "Trademark Registration",
    value: "trademark",
  },
  {
    label: "ISO Certification",
    value: "iso",
  },
  {
    label: "FSSAI License",
    value: "fssai",
  },
  {
    label: "MSME Registration",
    value: "msme",
  },
  {
    label: "Other",
    value: "other",
  },
];

export default function ContactForm() {
  const form = useForm<any>({
    resolver: zodResolver(contactSchema) as any,

    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      companyName: "",
      service: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    const submissionPromise = fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.fullName,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: `${data.subject ? data.subject + " - " : ""}${data.message}`,
      }),
    }).then(async (res) => {
      if (!res.ok) throw new Error("Failed to submit inquiry");
      return res.json();
    });

    notify.promise(submissionPromise, {
      loading: {
        title: "Sending Message",
        description: "Submitting inquiry to legal team...",
      },
      success: {
        title: "Message Sent!",
        description: "Inquiry saved! Our team will contact you shortly.",
      },
      error: {
        title: "Failed to Send",
        description: "An error occurred while sending your message. Please try again.",
      },
    });

    try {
      await submissionPromise;
      form.reset();
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          control={form.control}
          name="fullName"
          label="Full Name"
          placeholder="John Doe"
          required
        />
        <InputField
          control={form.control}
          name="email"
          label="Email Address"
          placeholder="john@example.com"
          required
        />
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <InputField
          control={form.control}
          name="phone"
          label="Phone Number"
          placeholder="+91 9876543210"
          required
        />

        <InputField
          control={form.control}
          name="companyName"
          label="Company Name"
          placeholder="ABC Pvt Ltd (Optional)"
        />
      </div>

      <SelectField
        control={form.control}
        name="service"
        label="Service Required"
        placeholder="Select Service"
        options={serviceOptions}
        required
      />

      <InputField
        control={form.control}
        name="subject"
        label="Subject"
        placeholder="Enter subject"
        required
      />

      <TextareaField
        control={form.control}
        name="message"
        label="Message"
        rows={3}
        placeholder="Tell us about your requirements..."
        required
      />

      <Button type="submit" loading={form.formState.isSubmitting} fullWidth>
        Send Message
      </Button>
    </form>
  );
}
