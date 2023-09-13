# frozen_string_literal: true

module NestedBroadcast
  extend ActiveSupport::Concern

  included do
    after_create_commit lambda {
      return unless broadcast_creation?

      broadcast_nested_resource_creation
      broadcast_nested_resource_count
    }

    after_destroy_commit lambda {
      broadcast_nested_resource_deletion
      broadcast_nested_resource_count
    }

    after_update_commit lambda {
      return unless broadcast_creation?

      broadcast_nested_resource_update
    }
  end

  private

  def broadcast_nested_resource_creation
    broadcast_nested_collection_channels.each do |channel|
      broadcast_prepend_later_to(
        channel,
        partial: "#{resource_name_plural}/row",
        locals: { resource: self },
        target: 'collection_rows'
      )
    end
  end

  def broadcast_nested_resource_deletion
    broadcast_nested_collection_channels.each do |channel|
      broadcast_remove_to(
        channel,
        target: "turbo_stream_#{resource_name}_#{id}"
      )
    end
  end

  def broadcast_nested_resource_update
    broadcast_nested_collection_channels.each do |channel|
      broadcast_replace_later_to(
        channel,
        partial: "#{resource_name_plural}/row",
        locals: { resource: self },
        target: "turbo_stream_#{resource_name}_#{id}"
      )
    end
  end

  def broadcast_nested_resource_count
    # Not using _later_ here to avoid an ActiveJob::DeserializationError when records are deleted
    broadcast_replace_to(
      "#{nested_resource_collection_id}_count",
      partial: 'badge_count',
      locals: {
        tab_id: nested_resource_collection_id,
        badge_count: parent.public_send(nested_association_name).size
      },
      target: "tab_#{nested_resource_collection_id}--badge_count__integer"
    )
  end

  def broadcast_nested_collection_channels
    ["#{parent.resource_name}_#{parent.id}_#{resource_name_plural}"]
  end

  def nested_resource_collection_id
    "#{parent.resource_name}_#{parent.id}_#{nested_association_name}"
  end

  def nested_association_name
    parent.klass_association_name(klass: self.class)
  end
end
