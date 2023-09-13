# frozen_string_literal: true

module Parent
  extend ActiveSupport::Concern

  def parent
    raise(NotImplementedError)
  end

  def association_with_class(klass:, macro: :has_many)
    self.class.reflect_on_all_associations(macro).select { |assoc| assoc.klass == klass }
  end

  def klass_association_name(klass:)
    association_with_class(klass: klass).first.name
  end
end
