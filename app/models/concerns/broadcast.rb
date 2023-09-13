# frozen_string_literal: true

module Broadcast
  extend ActiveSupport::Concern

  included do
    after_create_commit lambda {
      return unless broadcast_creation?

      broadcast_resource_creation
    }

    after_destroy_commit lambda {
      broadcast_resource_deletion
      # TODO: Do not broadcast to user performing deletion
      broadcast_append_to(
        resource_name_plural,
        partial: 'notification',
        locals: {
          name: "notification_#{resource_name}_#{id}",
          type: 'information',
          message: "A user deleted '#{self}'."
        },
        target: 'notifications'
      )
      broadcast_notification(type: 'warning', message: I18n.t('models.broadcast.delete.warning'))
    }

    after_update_commit lambda {
      return unless broadcast_update?

      broadcast_resource_update
      broadcast_replace_later_to(
        resource_name,
        partial: "#{resource_name_plural}/resource",
        locals: {
          action: :show, resource: self, resource_class: self.class, readonly: true, token: form_authenticity_token
        },
        target: "turbo_stream_show_#{resource_name}_#{id}"
      )
      broadcast_replace_later_to(
        resource_name,
        partial: "#{resource_name_plural}/resource",
        locals: {
          action: :edit, resource: self, resource_class: self.class, readonly: false, token: form_authenticity_token
        },
        target: "turbo_stream_edit_#{resource_name}_#{id}"
      )
      broadcast_replace_later_to(
        "breadcrumb_navigation_#{resource_name}_#{id}",
        partial: 'breadcrumb',
        locals: { label: to_s },
        target: "breadcrumb_#{resource_name}_#{id}--link_label"
      )
      broadcast_notification(type: 'warning', message: I18n.t('models.broadcast.update.warning'))
    }
  end

  private

  def broadcast_creation?
    true
  end

  def broadcast_update?
    true
  end

  def broadcast_notification(type:, message:)
    broadcast_append_later_to(
      "notification_#{resource_name}_#{id}",
      partial: 'notification',
      locals: {
        name: "notification_#{resource_name}_#{id}",
        type: type,
        message: message
      },
      target: 'notifications'
    )
  end

  def broadcast_resource_creation
    broadcast_prepend_later_to(
      broadcast_collection_channel,
      partial: "#{resource_name_plural}/row",
      locals: { resource: self },
      target: 'collection_rows'
    )
  end

  def broadcast_resource_deletion
    broadcast_remove_to(
      broadcast_collection_channel,
      target: "turbo_stream_#{resource_name}_#{id}"
    )
  end

  def broadcast_resource_update
    broadcast_replace_later_to(
      broadcast_collection_channel,
      partial: "#{resource_name_plural}/row",
      locals: { resource: self },
      target: "turbo_stream_#{resource_name}_#{id}"
    )
  end

  def broadcast_collection_channel
    resource_name_plural
  end
end
