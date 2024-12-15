module Api
  module V1
    module Admins
      class RecipeController < DashboardsController
        before_action :set_recipe, only: %i[  edit_title update_title create_directions ]

        def new_title
          @recipe = Recipe.new
        end

        def create_title
          if params[:edit]
            @recipe = Recipe.find(params[:id])
            @recipe.title = params[:title]
          else
            @recipe = Recipe.new(recipe_params)
          end


          respond_to do |format| 
            if @recipe.save
              # format.turbo_stream {render turbo_stream: turbo_stream.replace(@recipe)}
              # format.turbo_stream
              # format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully created." }
              # Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, target: "recipe-update-#{@recipe.id}", partial: "recipes/recipe_sub_form", locals: {id: @recipe.id}
              format.json { render :show, status: :created, location: @recipe }
            else
              format.html { render :new_title, status: :unprocessable_entity }
              format.json { render json: @recipe.errors, status: :unprocessable_entity }
            end
          end
        end

        def edit_title
        end

        def update_title
          respond_to do |format| 
            if @recipe.update(recipe_params)
              # format.turbo_stream {render turbo_stream: turbo_stream.replace(@recipe)}
              # format.turbo_stream
              # format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully created." }
              # Turbo::StreamsChannel.broadcast_replace_to :recipe_form_update, target: "recipe-update-#{@recipe.id}", partial: "recipes/recipe_sub_form", locals: {id: @recipe.id}
              format.json { render :index, status: :created, location: @recipe }
            else
              format.html { render :new_title, status: :unprocessable_entity }
              format.json { render json: @recipe.errors, status: :unprocessable_entity }
            end
          end
        end

        def new_ingredient
          @ingredient = Ingredient.new
          @recipe_id = params[:id]
        end

        def edit_ingredient
        end

        def create_directions
          params[:direction].each do |index, item|
            @recipe.directions << item
          end

          if @recipe.save
            Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
                  target: "recipe_#{@recipe.id}", 
                  partial: "admins/recipes/recipe_sub_ingredient_list", 
                  locals: {id: @recipe.id, index: 0, ingredient: @recipe_ingredient, recipe: @recipe}

            flash.now[:notice] = "Recipe direction created successfully"

            format.turbo_stream
            format.html { redirect_to recipe_url(@recipe), notice: "Recipe was successfully updated." }
            format.json { render :show, status: :ok, location: @recipe }
          else 
            format.html { render :edit, status: :unprocessable_entity }
            format.json { render json: @recipe.errors, status: :unprocessable_entity }
          end
        end

        def edit_direction
          direction_id = params[:direction_id].to_i
          @direction_id = direction_id || 2
          # @ingredient = Recipe.find(params[:recipe_id]).directions.select.with_index{ |direction, index| index === direction_id}
          ingredient = Recipe.find(params[:recipe_id]).directions
          @ingredient = ingredient.select.with_index{|ingredient, idx|  idx === direction_id}
          @recipe_id = params[:recipe_id]
        end

        def update_direction
          ingredient = Recipe.find(params[:recipe_id])
          ingredient.directions[params[:id].to_i] = params[:direction]

          if  ingredient.save!
            # Turbo::StreamsChannel.broadcast_prepend_to :recipe_form_update, 
            #       target: "recipe_#{@recipe.id}", 
            #       partial: "recipes/recipe_sub_ingredient_list", 
            #       locals: {id: @recipe.id, index: 0, ingredient: @recipe_ingredient, recipe: @recipe}
            flash.now[:notice] = "Recipe direction updated successfully"

            format.turbo_stream

            format.html {  }
            format.json {  }
          else 
            format.html { render :edit, status: :unprocessable_entity }
            format.json { render json: @recipe.errors, status: :unprocessable_entity }
          end
        end


        def delete_direction
          ingredient = Recipe.find(params[:recipe_id])
          ingredient.directions.delete_at(params[:id])

          if  ingredient.save!
            Turbo::StreamsChannel.broadcast_remove_to :recipe_form_update, target: "edit_ddirection_#{params[:id]}"

            flash.now[:alert] = "Recipe direction deleted successfully"
            format.html {  }
            format.json {  }
          else 
            format.html { render :edit, status: :unprocessable_entity }
            format.json { render json: @recipe.errors, status: :unprocessable_entity }
          end
        end


        private

        def set_recipe
          @recipe = Recipe.find(params[:id])
        end

      end
    end
  end
end