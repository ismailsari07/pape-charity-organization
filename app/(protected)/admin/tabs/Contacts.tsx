"use client";

import { useEffect, useState } from "react";
import TabHeader from "../components/TabHeader";
import { DataTable } from "../components/data-table";
import { Contact, ContactFormData } from "../contact/types";
import { getContacts, createContact, updateContact, deleteContact } from "@/lib/api/contacts";
import { getContactColumns } from "../contact/components/contacts-columns";
import ContactDialog from "../contact/components/ContactDialog";
import DeleteConfirmDialog from "../contact/components/DeleteConfirmDialog";
import { ContactTableToolbar } from "../contact/components/ContactTableToolbar";
import { toast } from "sonner";

// TODO: refactor this component
export default function ContactsTab() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch contacts on mount
  useEffect(() => {
    loadContacts();
  }, []);

  const loadContacts = async () => {
    try {
      setLoading(true);
      const data = await getContacts();
      setContacts(data);
    } catch (error) {
      toast.error(`Failed to load contacts`);

      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (contact?: Contact) => {
    setSelectedContact(contact || null);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedContact(null);
  };

  const handleSaveContact = async (data: ContactFormData) => {
    try {
      setIsSubmitting(true);
      if (selectedContact) {
        await updateContact(selectedContact.id, data);
        toast.success(`Contact updated successfully`);
      } else {
        await createContact(data);
        toast.success(`Contact created successfully`);
      }
      await loadContacts();
      handleCloseDialog();
    } catch (error) {
      toast.error(`Failed to ${selectedContact ? "update" : "create"} contact`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (contact: Contact) => {
    handleOpenDialog(contact);
  };

  const handleDeleteClick = (contact: Contact) => {
    setSelectedContact(contact);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedContact) return;

    try {
      setIsSubmitting(true);
      await deleteContact(selectedContact.id);
      toast.success(`Contact deleted successfully`);
      await loadContacts();
      setDeleteDialogOpen(false);
      setSelectedContact(null);
    } catch (error) {
      toast.error(`Failed to delete contact`);
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = getContactColumns({
    onEdit: handleEditClick,
    onDelete: handleDeleteClick,
  });

  return (
    <div className="space-y-4">
      <TabHeader title="Contact Information" description="Manage contact information for team members" />

      <DataTable
        columns={columns}
        data={contacts}
        renderToolbar={() => <ContactTableToolbar onClickAddButton={() => handleOpenDialog()} />}
        onRowSelect={() => {}}
        rowSelection={{}}
        onRowSelectionChange={() => {}}
      />

      <ContactDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contact={selectedContact}
        onSave={handleSaveContact}
        isLoading={isSubmitting}
      />

      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${selectedContact?.full_name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isLoading={isSubmitting}
      />
    </div>
  );
}
